import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TransactionsPageClient } from "@/components/dashboard/TransactionsPageClient";

export const metadata = {
  title: "Transaksi Saya | Koneksi.io",
};

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <TransactionsPageClient initialTransactions={transactions || []} />;
}
