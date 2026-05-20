import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { BookOpen, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Koneksi.io",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek apakah user adalah admin
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    redirect("/admin");
  }

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, themes(*)")
    .eq("user_id", user.id);

  // Fetch progress (dummy or real depending on data)
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*, lessons(*)")
    .eq("user_id", user.id);

  const completedLessons = progress?.filter((p: any) => p.is_completed).length || 0;
  
  // Dummy chart data showing learning activity over a few months
  const chartData = [
    { name: "Jan", total: Math.floor(Math.random() * 10) },
    { name: "Feb", total: Math.floor(Math.random() * 15) },
    { name: "Mar", total: Math.floor(Math.random() * 20) },
    { name: "Apr", total: Math.floor(Math.random() * 25) },
    { name: "Mei", total: completedLessons || Math.floor(Math.random() * 30) },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ikhtisar Dashboard</h2>
        <p className="text-slate-500">Pantau perkembangan aktivitas, progres belajar, dan kursus Anda hari ini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Kursus Dimiliki</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{enrollments?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Materi premium yang bisa diakses</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Materi Selesai</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <Trophy className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedLessons}</div>
            <p className="text-xs text-slate-500 mt-1">Sub-bab telah diselesaikan</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Jam Belajar</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-md">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12j 30m</div>
            <p className="text-xs text-slate-500 mt-1">Estimasi waktu belajar bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Belajar</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Kursus Saya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {enrollments && enrollments.length > 0 ? (
                enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden shrink-0 mr-4">
                      {enrollment.themes?.thumbnail_url ? (
                        <img src={enrollment.themes.thumbnail_url} alt="Course" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800" />
                      )}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{enrollment.themes?.title}</p>
                      <p className="text-sm text-slate-500">Akses Lifetime</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Link href={`/katalog/${enrollment.themes?.slug}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                        Belajar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm mb-4">Anda belum memiliki kursus premium.</p>
                  <Link href="/katalog" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Jelajahi Katalog
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
