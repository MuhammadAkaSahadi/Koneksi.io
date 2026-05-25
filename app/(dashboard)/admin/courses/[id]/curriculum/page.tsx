import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CurriculumManager } from "@/components/dashboard/CurriculumManager";

export const metadata = {
  title: "Kelola Modul & Silabus | Admin Koneksi.io",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseCurriculumPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Bypass RLS to verify admin role
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  // Fetch the theme (course) details
  const { data: theme } = await supabase
    .from("themes")
    .select("id, title, slug")
    .eq("id", id)
    .single();

  if (!theme) {
    notFound();
  }

  // Fetch the chapters and nested lessons
  const { data: chaptersData } = await supabase
    .from("chapters")
    .select("*, lessons(*)")
    .eq("theme_id", id)
    .order("order_index", { ascending: true });

  const chapters = (chaptersData || []).map((chapter: any) => {
    // Sort lessons of this chapter by order_index
    const lessons = chapter.lessons 
      ? [...chapter.lessons].sort((a: any, b: any) => a.order_index - b.order_index)
      : [];
    return {
      ...chapter,
      lessons
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Kelola Modul Pembelajaran
        </h1>
        <p className="text-slate-500 text-sm">
          Atur modul pembelajaran dan materi video yang ada di dalam kurikulum ini.
        </p>
      </div>

      {/* Curriculum Manager Client Component */}
      <CurriculumManager theme={theme} initialChapters={chapters} />

    </div>
  );
}
