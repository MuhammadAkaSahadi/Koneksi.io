import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { FeedbackForm } from "./FeedbackForm";

export const metadata = {
  title: "Kritik & Saran | Koneksi.io",
};

export default async function FeedbackPage() {
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

  // Mengambil riwayat masukan milik user saat ini
  const { data: feedbacks } = await supabase
    .from("feedbacks")
    .select("id, type, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Peta tipe as 'kritik' | 'saran' untuk keselarasan TypeScript
  const typedFeedbacks = (feedbacks || []).map((f: any) => ({
    id: f.id,
    type: f.type as "kritik" | "saran",
    content: f.content,
    created_at: f.created_at,
  }));

  return <FeedbackForm feedbacks={typedFeedbacks} />;
}
