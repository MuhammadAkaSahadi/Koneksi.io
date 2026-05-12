import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { themeId, themeTitle, price } = await req.json();

    if (!themeId || !price || !themeTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Generate unique order ID
    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        email: user.email,
        // Since we don't capture name yet in basic auth, we can just use email prefix
        first_name: user.email?.split("@")[0] || "User",
      },
      item_details: [
        {
          id: themeId,
          price: price,
          quantity: 1,
          name: themeTitle.substring(0, 50), // Midtrans max length is 50
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);
    
    // Save pending transaction to database
    await supabase.from("transactions").insert({
      transaction_id_midtrans: orderId,
      user_id: user.id,
      item_name: themeTitle,
      subtotal: price,
      total_amount: price,
      status: "pending",
      payment_type: "midtrans_snap"
    });

    return NextResponse.json({ token: transaction.token, orderId });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}
