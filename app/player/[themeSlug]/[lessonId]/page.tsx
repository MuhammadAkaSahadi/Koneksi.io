import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { YoutubePlayer } from "@/components/player/YoutubePlayer";
import { ChevronLeft, Lock, PlayCircle, Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ themeSlug: string; lessonId: string }>;
}) {
  const supabase = await createClient();
  const { themeSlug, lessonId } = await params;

  // Middleware ensures user is logged in, but let's be safe
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

  // Find the current lesson
  let currentLesson = null;
  let currentChapter = null;

  for (const chapter of theme.chapters || []) {
    const lesson = chapter.lessons?.find((l: any) => l.id === lessonId);
    if (lesson) {
      currentLesson = lesson;
      currentChapter = chapter;
      break;
    }
  }

  if (!currentLesson) {
    notFound();
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("theme_id", theme.id)
    .single();

  const isEnrolled = !!enrollment;

  // If lesson is not free and user not enrolled, redirect to checkout
  if (!currentLesson.is_free && !isEnrolled) {
    redirect(`/checkout/${themeSlug}`);
  }

  // Sort chapters and lessons for sidebar
  const chapters = theme.chapters?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  chapters.forEach((chapter: any) => {
    if (chapter.lessons) {
      chapter.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    }
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-4 md:p-6 border-b border-slate-800">
        <Link href={`/katalog/${theme.slug}`} className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali ke Detail Kursus
        </Link>
        <h2 className="text-lg font-bold text-white leading-tight">{theme.title}</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {chapters.map((chapter: any) => (
            <div key={chapter.id} className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{chapter.title}</h3>
              <div className="space-y-1">
                {chapter.lessons?.map((lesson: any) => {
                  const isActive = lesson.id === lessonId;
                  const canAccess = lesson.is_free || isEnrolled;

                  return (
                    <Link
                      key={lesson.id}
                      href={canAccess ? `/player/${themeSlug}/${lesson.id}` : `/checkout/${themeSlug}`}
                      className={`group flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary/20 text-primary-foreground" 
                          : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {canAccess ? (
                          <PlayCircle className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-500 group-hover:text-white"}`} />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <span className={`text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                        {lesson.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950">
      {/* Mobile Sidebar */}
      <Sheet>
        <div className="lg:hidden absolute top-20 left-4 z-50">
          <SheetTrigger render={<Button variant="outline" size="icon" className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:text-white" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="p-0 w-80 bg-slate-900 border-r-slate-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0 border-r border-slate-800 h-full overflow-hidden relative z-10">
        <SidebarContent />
      </aside>

      {/* Main Player Area */}
      <main className="flex-1 overflow-y-auto h-full relative">
        <div className="max-w-5xl mx-auto p-4 md:p-8 pt-16 lg:pt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-primary text-sm font-bold uppercase tracking-wider">
              {currentChapter?.title}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-white">
              {currentLesson.title}
            </h1>
          </div>
          
          <YoutubePlayer id={currentLesson.youtube_id} title={currentLesson.title} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
            <h3 className="text-lg font-bold text-white mb-4">Deskripsi Materi</h3>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{currentLesson.description || "Tidak ada deskripsi untuk materi ini."}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
