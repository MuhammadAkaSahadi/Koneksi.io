"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function approveTransaction(transactionId: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update transaction status to success
    // The trigger will automatically create enrollment
    const { error: updateError } = await adminSupabase
      .from("transactions")
      .update({ status: "success" })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Update Transaction Error:", updateError);
      throw new Error("Gagal approve transaksi");
    }

    // Revalidate admin transactions page
    revalidatePath("/admin/transactions");

    return { success: true, message: "Transaksi berhasil diapprove" };
  } catch (error: any) {
    console.error("Approve Transaction Error:", error);
    throw new Error(error.message || "Gagal approve transaksi");
  }
}

export async function rejectTransaction(transactionId: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update transaction status to failed
    const { error: updateError } = await adminSupabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Reject Transaction Error:", updateError);
      throw new Error("Gagal reject transaksi");
    }

    // Revalidate admin transactions page
    revalidatePath("/admin/transactions");

    return { success: true, message: "Transaksi berhasil ditolak" };
  } catch (error: any) {
    console.error("Reject Transaction Error:", error);
    throw new Error(error.message || "Gagal reject transaksi");
  }
}
