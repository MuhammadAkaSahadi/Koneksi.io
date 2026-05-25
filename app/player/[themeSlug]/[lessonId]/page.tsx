import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CoursePlayer } from "@/components/player/CoursePlayer";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ themeSlug: string; lessonId: string }>;
}) {
  const supabase = await createClient();
  const { themeSlug, lessonId } = await params;

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/player/${themeSlug}/${lessonId}`);
  }

  // Fetch theme with chapters and lessons
  const { data: theme } = await supabase
    .from("themes")
    .select("*, chapters(*, lessons(*))")
    .eq("slug", themeSlug)
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

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("theme_id", theme.id)
    .single();

  const isEnrolled = !!enrollment;

  // Find the lesson
  let lessonExists = false;
  for (const chapter of chapters) {
    const found = chapter.lessons?.find((l: any) => l.id === lessonId);
    if (found) {
      lessonExists = true;
      // If lesson is not free and user not enrolled, redirect to checkout
      if (!found.is_free && !isEnrolled) {
        redirect(`/checkout/${themeSlug}`);
      }
      break;
    }
  }

  if (!lessonExists) {
    notFound();
  }

  // Fetch completed lesson IDs for current user
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedLessonIds = progressData?.map((p: any) => p.lesson_id) || [];

  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)]">
      <CoursePlayer
        theme={theme}
        chapters={chapters}
        isEnrolled={isEnrolled}
        initialCompletedLessonIds={completedLessonIds}
        userId={user.id}
        initialActiveLessonId={lessonId}
      />
    </div>
  );
}
