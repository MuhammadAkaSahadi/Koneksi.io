import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Helper to create admin client with service role
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData
    const formData = await req.formData();
    const themeId = formData.get("themeId") as string;
    const themeTitle = formData.get("themeTitle") as string;
    const basePrice = Number(formData.get("price"));
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const file = formData.get("transferProof") as File;

    // Validate required fields
    if (!themeId || !themeTitle || !basePrice || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Hanya file gambar (PNG/JPG) yang diperbolehkan" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    // Verify user doesn't already have access
    const { data: existingAccess } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("theme_id", themeId)
      .single();

    if (existingAccess) {
      return NextResponse.json({ error: "Anda sudah memiliki akses ke tema ini" }, { status: 400 });
    }

    // Generate unique 3-digit code
    let uniqueCode: number;
    let attempts = 0;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    do {
      uniqueCode = Math.floor(Math.random() * 900) + 100; // 100-999

      const { data: existing } = await adminSupabase
        .from("transactions")
        .select("id")
        .eq("unique_code", uniqueCode)
        .gte("created_at", twentyFourHoursAgo)
        .maybeSingle();

      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json({ error: "Gagal generate kode unik. Silakan coba lagi." }, { status: 500 });
    }

    const totalAmount = basePrice + uniqueCode;

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from("transfer-proofs")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return NextResponse.json({ error: "Gagal upload bukti transfer" }, { status: 500 });
    }

    // Generate transaction ID
    const transactionId = `QRIS-${Date.now()}-${uniqueCode}`;

    // Insert transaction record
    const { error: insertError } = await adminSupabase
      .from("transactions")
      .insert({
        transaction_id_midtrans: transactionId,
        user_id: user.id,
        theme_id: themeId,
        item_name: themeTitle,
        subtotal: basePrice,
        total_amount: totalAmount,
        unique_code: uniqueCode,
        voucher_amount: 0,
        status: "pending",
        payment_type: "qris_static",
        transfer_proof_url: uploadData.path,
      });

    if (insertError) {
      console.error("Insert Transaction Error:", insertError);

      // Rollback: delete uploaded file
      await adminSupabase.storage.from("transfer-proofs").remove([fileName]);

      return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactionId,
      uniqueCode,
      totalAmount,
      message: "Transaksi berhasil dibuat. Menunggu verifikasi admin."
    });

  } catch (error: any) {
    console.error("Checkout QRIS Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}
