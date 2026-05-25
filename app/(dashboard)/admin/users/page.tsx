import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/dashboard/UsersTable";

export const metadata = {
  title: "Manajemen Pengguna | Admin Koneksi.io",
};

export default async function AdminUsersPage() {
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

  // Query semua profil pengguna di database
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Map data untuk memastikan default status terisi jika kosong
  const parsedUsers = (profiles || []).map((p: any) => ({
    ...p,
    status: p.status || "Aktif",
    banned_reason: p.banned_reason || null
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Manajemen Pengguna
        </h1>
        <p className="text-slate-500 text-sm">
          Pantau aktivitas siswa, ubah status keanggotaan, ubah role akses, atau tangguhkan akun pengguna yang melanggar ketentuan.
        </p>
      </div>

      {/* Tabel Pengguna Klien */}
      <UsersTable initialUsers={parsedUsers} />

    </div>
  );
}
