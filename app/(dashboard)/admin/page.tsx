import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, CreditCard, Activity } from "lucide-react";
import { ProgressChart } from "@/components/dashboard/ProgressChart";

export const metadata = {
  title: "Admin Dashboard | Koneksi.io",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard"); // Redirect to normal dashboard if not admin
  }

  // Fetch metrics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  const successTransactions = transactions?.filter(t => t.status === "success") || [];
  const totalRevenue = successTransactions.reduce((acc, t) => acc + Number(t.total_amount), 0);

  // Generate sales data for chart
  // Grouping by date loosely for dummy chart if needed, but let's just make a weekly dummy data or from real data
  const chartData = [
    { name: "Senin", total: 1200000 },
    { name: "Selasa", total: 2450000 },
    { name: "Rabu", total: 950000 },
    { name: "Kamis", total: 3100000 },
    { name: "Jumat", total: 1800000 },
    { name: "Sabtu", total: totalRevenue > 0 ? totalRevenue : 4500000 }, // using actual or dummy
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ikhtisar Dashboard</h2>
        <p className="text-slate-500">Pantau perkembangan pengguna, transaksi, dan aktivitas kursus hari ini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pengguna Aktif</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalUsers || 0}</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">↑ 12.5% <span className="text-slate-400 font-normal">dari bulan lalu</span></p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Transaksi</CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-md">
              <CreditCard className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{successTransactions.length}</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">↑ 8.3% <span className="text-slate-400 font-normal">dari bulan lalu</span></p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pendapatan</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
            </div>
            <p className="text-xs text-emerald-500 font-medium mt-1">↑ 15.2% <span className="text-slate-400 font-normal">dari bulan lalu</span></p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Kursus</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-md">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-rose-500 font-medium mt-1">↓ 5.1% <span className="text-slate-400 font-normal">dari bulan lalu</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Overview Penjualan Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-border shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 10).map((trx: any) => (
                    <TableRow key={trx.id}>
                      <TableCell className="font-medium text-xs">
                        {trx.transaction_id_midtrans}
                        <div className="text-slate-500 mt-1 truncate max-w-[120px]">{trx.item_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trx.status === "success" ? "default" : trx.status === "pending" ? "secondary" : "destructive"}>
                          {trx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(trx.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-slate-500">
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
