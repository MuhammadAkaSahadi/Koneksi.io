import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CoursesTable } from "@/components/dashboard/CoursesTable";

export const metadata = {
  title: "Kelola Modul | Admin Koneksi.io",
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek otorisasi admin via service role client (bypass RLS)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  // Query semua data modul (themes) dari database
  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .order("created_at", { ascending: false });

  // Konversi data numerik harga dan kode unik
  const parsedCourses = (themes || []).map((t: any) => ({
    ...t,
    price_lifetime: Number(t.price_lifetime),
    unique_code: t.unique_code ? Number(t.unique_code) : 0
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Kelola Modul
        </h1>
        <p className="text-slate-500 text-sm">
          Buat, ubah detail, atur harga, dan publikasikan materi pembelajaran IoT Koneksi.io.
        </p>
      </div>

      {/* Tabel Modul Klien */}
      <CoursesTable initialCourses={parsedCourses} />

    </div>
  );
}
