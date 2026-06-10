import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminFeedbackClient } from "./AdminFeedbackClient";

export const metadata = {
  title: "Kelola Kritik & Saran | Admin Koneksi.io",
};

export default async function AdminFeedbackPage() {
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

  // Mengambil seluruh data kritik & saran beserta data profil pengirim
  const { data: feedbacks } = await adminClient
    .from("feedbacks")
    .select(`
      id,
      type,
      content,
      created_at,
      profiles (
        full_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  // Peta data ke tipe yang sesuai
  const typedFeedbacks = (feedbacks || []).map((f: any) => ({
    id: f.id,
    type: f.type as "kritik" | "saran",
    content: f.content,
    created_at: f.created_at,
    profiles: f.profiles ? {
      full_name: f.profiles.full_name,
      email: f.profiles.email,
      avatar_url: f.profiles.avatar_url,
    } : null,
  }));

  return <AdminFeedbackClient feedbacks={typedFeedbacks} />;
}
