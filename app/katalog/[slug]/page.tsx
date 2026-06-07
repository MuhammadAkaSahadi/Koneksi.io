import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CoursePlayer } from "@/components/player/CoursePlayer";
import { KatalogVideoPreview } from "@/components/catalog/KatalogVideoPreview";
import { KatalogCheckoutForm } from "@/components/checkout/KatalogCheckoutForm";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  youtube_id: string;
  description: string | null;
  is_free: boolean;
  order_index: number;
  duration: string | null;
  created_at: string;
}

interface Chapter {
  id: string;
  theme_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
  created_at: string;
}

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
  const rawChapters = theme.chapters as Chapter[] | undefined;
  const chapters = rawChapters?.sort((a, b) => a.order_index - b.order_index) || [];
  chapters.forEach((chapter) => {
    if (chapter.lessons) {
      chapter.lessons.sort((a, b) => a.order_index - b.order_index);
    }
  });

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  let isEnrolled = false;
  let completedLessonIds: string[] = [];
  let profile = null;

  if (user) {
    // Fetch profile info
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    profile = profileData;

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

      completedLessonIds = progressData?.map((p: { lesson_id: string }) => p.lesson_id) || [];

      // Redirect enrolled user directly to the player page
      const firstLesson = chapters.flatMap((c) => c.lessons || [])[0];
      const targetLessonId = activeLessonId || (firstLesson ? firstLesson.id : "");
      if (targetLessonId) {
        redirect(`/player/${theme.slug}/${targetLessonId}`);
      }
    }
  }

  // If user has access (enrolled fallback), render player
  if (isEnrolled) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-600">
        {/* Header bar back to catalog */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-lg">
                K.
              </div>
              <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">Koneksi.io</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/katalog" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-wider transition-colors">
              Semua Modul
            </Link>
            {!user && (
              <Link href="/login" className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors">
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

  // Find all lessons in order that are marked as free
  const freeLessons = chapters.flatMap((c) => c.lessons || []).filter((l) => l.is_free);

  // Otherwise, render page preview (Gambar 1 style) in premium light mode
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-24 text-slate-650">
      {/* Header bar */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-lg">
              K.
            </div>
            <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">Koneksi.io</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/katalog" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-wider transition-colors">
            Semua Modul
          </Link>
          {!user && (
            <Link href="/login" className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors">
              Masuk
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8 space-y-8">
        {/* Course Card Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-left">
          <div className="aspect-video w-full relative bg-slate-100 border-b border-slate-200 md:h-[320px] md:aspect-auto">
            {theme.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.thumbnail_url} alt={theme.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 font-heading leading-tight">{theme.title}</h2>
              <p className="text-xs text-slate-500 mt-1.5">Akses Kelas Selamanya • Belajar IoT & Tech Mandiri</p>
            </div>
            <Link href="/katalog" className="text-xs font-bold text-primary hover:text-primary/90 transition-colors uppercase tracking-wider whitespace-nowrap">
              Kembali ke Katalog
            </Link>
          </div>
        </div>

        {/* Video Preview Section (displays above Informasi Pembeli/Form) */}
        <KatalogVideoPreview
          freeLessons={freeLessons}
          themePreviewVideoUrl={theme.preview_video_url}
          themeTitle={theme.title}
        />

        {/* Checkout Form & Billing Summary Container */}
        <KatalogCheckoutForm
          theme={{
            id: theme.id,
            title: theme.title,
            slug: theme.slug,
            price_lifetime: Number(theme.price_lifetime),
            thumbnail_url: theme.thumbnail_url || null,
            unique_code: theme.unique_code ? Number(theme.unique_code) : 0,
            discount: theme.discount ? Number(theme.discount) : 0,
          }}
          user={user ? { id: user.id, email: user.email || "" } : null}
          profile={profile}
        />
      </div>
    </div>
  );
}

