import { createClient } from "@/utils/supabase/server";
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kursus Dimiliki</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
            <p className="text-xs text-slate-500">Materi premium yang bisa diakses</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materi Selesai</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <p className="text-xs text-slate-500">Sub-bab telah diselesaikan</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jam Belajar</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12j 30m</div>
            <p className="text-xs text-slate-500">Estimasi waktu belajar bulan ini</p>
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
