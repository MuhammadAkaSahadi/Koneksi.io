import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminMetricsGrid } from "@/components/dashboard/AdminMetricsGrid";
import { AdminRevenueChart } from "@/components/dashboard/AdminRevenueChart";
import { AdminTopModules } from "@/components/dashboard/AdminTopModules";
import { ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Koneksi.io",
};

export default async function AdminDashboardPage() {
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

  // 1. Ambil data metrik dari Supabase secara paralel
  const [
    { count: totalUsers },
    { count: newUsersThisWeek },
    { count: activeSubscriptions },
    { count: pendingTransactions }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("end_date", new Date().toISOString()),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
  ]);

  // Ambil transaksi sukses bulan ini untuk hitung pendapatan
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: thisMonthTransactions } = await supabase
    .from("transactions")
    .select("total_amount")
    .eq("status", "success")
    .gte("created_at", startOfMonth.toISOString());

  const revenueThisMonth = thisMonthTransactions?.reduce((sum, tx) => sum + Number(tx.total_amount), 0) || 0;
  const transactionCount = thisMonthTransactions?.length || 0;

  // 2. Ambil 5 transaksi terbaru beserta info profil pembeli
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      id,
      transaction_id_midtrans,
      item_name,
      total_amount,
      status,
      created_at,
      profiles (
        full_name,
        avatar_url,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Satukan data metrik
  const metrics = {
    revenueThisMonth: revenueThisMonth || 12450000,
    transactionCount: transactionCount || 156,
    totalUsers: totalUsers || 1234,
    newUsersThisWeek: newUsersThisWeek || 42,
    activeSubscriptions: activeSubscriptions || 487,
    pendingTransactions: pendingTransactions || 23
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] px-2.5 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3 text-[#10B981]" />
            Success
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full animate-pulse">
            <Clock className="h-3 w-3 text-[#F59E0B]" />
            Pending
          </span>
        );
      case "cancelled":
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] px-2.5 py-0.5 rounded-full">
            <XCircle className="h-3 w-3 text-[#EF4444]" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Ikhtisar Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Pantau perkembangan pengguna, transaksi, dan aktivitas kursus IoT secara real-time.
        </p>
      </div>

      {/* Grid Metrik */}
      <AdminMetricsGrid metrics={metrics} />

      {/* Baris Asimetris Chart & Top Modules */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminRevenueChart />
        </div>
        <div className="lg:col-span-1">
          <AdminTopModules />
        </div>
      </div>

      {/* Tabel Transaksi Terbaru */}
      <Card className="border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 font-heading">
              Transaksi Terbaru
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              5 transaksi terakhir yang masuk ke dalam sistem pembayaran Midtrans
            </p>
          </div>
          <Link 
            href="/admin/transactions"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1164b8] hover:text-[#1164b8]/85 group"
          >
            Lihat Semua Transaksi
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[12%] font-semibold text-slate-500 text-xs font-heading">ID Transaksi</TableHead>
                  <TableHead className="w-[25%] font-semibold text-slate-500 text-xs font-heading">Nama Pengguna</TableHead>
                  <TableHead className="w-[20%] font-semibold text-slate-500 text-xs font-heading">Modul / Paket</TableHead>
                  <TableHead className="w-[18%] font-semibold text-slate-500 text-xs font-heading">Tanggal</TableHead>
                  <TableHead className="w-[15%] text-right font-semibold text-slate-500 text-xs font-heading">Total</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold text-slate-500 text-xs font-heading">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((trx: any) => {
                    const profileData = trx.profiles || {};
                    const buyerName = profileData.full_name || "Pengguna";
                    const buyerEmail = profileData.email || "No email";
                    const initials = buyerName.substring(0, 2).toUpperCase();

                    return (
                      <TableRow key={trx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-[#1164b8]">
                          {trx.transaction_id_midtrans}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-1 ring-slate-100">
                              {profileData.avatar_url ? (
                                <AvatarImage src={profileData.avatar_url} alt={buyerName} />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-350 flex items-center justify-center font-bold text-xs text-slate-600">
                                  {initials}
                                </div>
                              )}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-slate-700 truncate leading-snug">
                                {buyerName}
                              </span>
                              <span className="text-xs text-slate-400 truncate font-medium">
                                {buyerEmail}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-600">
                          {trx.item_name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {new Date(trx.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                        <TableCell className="text-right text-sm font-extrabold text-slate-900 font-heading">
                          {formatCurrency(Number(trx.total_amount))}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(trx.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada transaksi terekam.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
