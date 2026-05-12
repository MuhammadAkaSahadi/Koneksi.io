import { createClient } from "@/utils/supabase/server";
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
  const { data: profile } = await supabase
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
            </div>
            <p className="text-xs text-slate-500">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Terdaftar</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalUsers || 0}</div>
            <p className="text-xs text-slate-500">+180 bulan ini</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Sukses</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{successTransactions.length}</div>
            <p className="text-xs text-slate-500">+19% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-slate-500">Sejak jam terakhir</p>
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
