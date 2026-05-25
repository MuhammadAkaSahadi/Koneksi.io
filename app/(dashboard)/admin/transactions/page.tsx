import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

export const metadata = {
  title: "Data Transaksi | Admin Koneksi.io",
};

export default async function AdminTransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek role admin via service role client (bypass RLS)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard"); // Pengalihan jika bukan admin
  }

  // Ambil data seluruh transaksi dengan join tabel profil pembeli
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      transaction_id_midtrans,
      user_id,
      item_name,
      subtotal,
      voucher_amount,
      total_amount,
      status,
      payment_type,
      transfer_proof_url,
      created_at,
      profiles (
        full_name,
        avatar_url,
        email,
        is_admin
      )
    `)
    .order("created_at", { ascending: false });

  // Parsing angka numerik untuk memastikan kompatibilitas di client-side
  const parsedTransactions = (transactions || []).map((t: any) => ({
    ...t,
    subtotal: Number(t.subtotal),
    voucher_amount: Number(t.voucher_amount),
    total_amount: Number(t.total_amount)
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Judul Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Manajemen Transaksi
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola riwayat pembayaran modul lifetime dan subscription paket belajar siswa Koneksi.io.
        </p>
      </div>

      {/* Tabel Transaksi Utama */}
      <TransactionsTable initialTransactions={parsedTransactions} />
    </div>
  );
}
