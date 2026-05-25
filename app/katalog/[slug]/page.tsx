import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CoursePlayer } from "@/components/player/CoursePlayer";
import Link from "next/link";

export default async function ThemeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const supabase = await createClient();
  const slug = (await params).slug;
  const sp = await searchParams;
  const activeLessonId = sp.lessonId || null;

  // Fetch theme with chapters and lessons
  const { data: theme } = await supabase
    .from("themes")
    .select("*, chapters(*, lessons(*))")
    .eq("slug", slug)
    .single();

  if (!theme) {
    notFound();
  }

  // Sort chapters and lessons
  const chapters = theme.chapters?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  chapters.forEach((chapter: any) => {
    if (chapter.lessons) {
      chapter.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    }
  });

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  let isEnrolled = false;
  let completedLessonIds: string[] = [];

  if (user) {
    // Check enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("theme_id", theme.id)
      .single();

    isEnrolled = !!enrollment;

    if (isEnrolled) {
      // Fetch completed lesson IDs
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      completedLessonIds = progressData?.map((p: any) => p.lesson_id) || [];

      // Redirect enrolled user directly to the player page
      const firstLesson = chapters.flatMap((c: any) => c.lessons || [])[0];
      const targetLessonId = activeLessonId || (firstLesson ? firstLesson.id : "");
      if (targetLessonId) {
        redirect(`/player/${theme.slug}/${targetLessonId}`);
      }
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#0c0d0f]">
      {/* Header bar back to catalog */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-[#0a0a0c] border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0891b2] text-white font-heading font-bold text-lg">
              K.
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-tight">Koneksi.io</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/katalog" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">
            Semua Modul
          </Link>
          {!user && (
            <Link href="/login" className="text-xs font-bold text-white bg-[#0891b2] hover:bg-[#0891b2]/90 px-4 py-2 rounded-lg transition-colors">
              Masuk
            </Link>
          )}
        </div>
      </div>

      <CoursePlayer
        theme={theme}
        chapters={chapters}
        isEnrolled={isEnrolled}
        initialCompletedLessonIds={completedLessonIds}
        userId={user?.id || null}
        initialActiveLessonId={activeLessonId}
      />
    </div>
  );
}
