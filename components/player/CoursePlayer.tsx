"use client";

import React, { useState, useMemo } from "react";
import { 
  Play, 
  BookOpen, 
  Lock, 
  Unlock, 
  Check, 
  ChevronDown, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  BookText
} from "lucide-react";
import { YoutubePlayer } from "./YoutubePlayer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface Theme {
  id: string;
  title: string;
  slug: string;
  price_lifetime: number;
}

interface CoursePlayerProps {
  theme: Theme;
  chapters: Chapter[];
  isEnrolled: boolean;
  initialCompletedLessonIds: string[];
  userId: string | null;
  initialActiveLessonId?: string | null;
}

export function CoursePlayer({
  theme,
  chapters,
  isEnrolled,
  initialCompletedLessonIds,
  userId,
  initialActiveLessonId
}: CoursePlayerProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Find all lessons in order
  const allLessons = useMemo(() => {
    return chapters.flatMap((c) => c.lessons || []);
  }, [chapters]);

  // Find default active lesson
  const defaultLesson = useMemo(() => {
    if (initialActiveLessonId) {
      const found = allLessons.find((l) => l.id === initialActiveLessonId);
      if (found) return found;
    }
    // Fallback to first lesson (or first free lesson if not enrolled)
    if (!isEnrolled) {
      const freeLesson = allLessons.find((l) => l.is_free);
      if (freeLesson) return freeLesson;
    }
    return allLessons[0] || null;
  }, [allLessons, initialActiveLessonId, isEnrolled]);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(defaultLesson);
  const [activeTab, setActiveTab] = useState<"video" | "tulisan">("video");
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );
  
  // Chapter collapse state map
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleLessonClick = (lesson: Lesson) => {
    const canAccess = lesson.is_free || isEnrolled;
    if (canAccess) {
      setActiveLesson(lesson);
      setActiveTab("video"); // default to video tab
      
      // Update browser URL query or navigation without full page reload if desired
      if (isEnrolled) {
        router.push(`/player/${theme.slug}/${lesson.id}`);
      } else {
        router.push(`/katalog/${theme.slug}?lessonId=${lesson.id}`);
      }
    } else {
      setActiveLesson(lesson); // still select so they see the lock overlay
    }
  };

  const toggleCompletion = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // prevent selecting lesson
    if (!userId || !isEnrolled) {
      toast.error("Anda harus masuk dan membeli kelas untuk menandai materi selesai.");
      return;
    }

    const isCurrentlyCompleted = completedLessonIds.has(lessonId);
    const updated = new Set(completedLessonIds);

    if (isCurrentlyCompleted) {
      updated.delete(lessonId);
      setCompletedLessonIds(updated);
      
      const { error } = await supabase
        .from("user_progress")
        .delete()
        .eq("user_id", userId)
        .eq("lesson_id", lessonId);

      if (error) {
        toast.error("Gagal memperbarui progres.");
        updated.add(lessonId);
        setCompletedLessonIds(updated);
      } else {
        toast.success("Materi ditandai belum selesai.");
      }
    } else {
      updated.add(lessonId);
      setCompletedLessonIds(updated);

      const { error } = await supabase
        .from("user_progress")
        .insert([{ user_id: userId, lesson_id: lessonId, is_completed: true }]);

      if (error) {
        toast.error("Gagal menyimpan progres.");
        updated.delete(lessonId);
        setCompletedLessonIds(updated);
      } else {
        toast.success("Materi berhasil diselesaikan! 🎉");
      }
    }
  };

  const handleNextVideo = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonClick(nextLesson);
    } else {
      toast.info("Anda sudah berada di materi terakhir!");
    }
  };

  const hasNextVideo = useMemo(() => {
    if (!activeLesson) return false;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    return currentIndex !== -1 && currentIndex < allLessons.length - 1;
  }, [activeLesson, allLessons]);

  const activeChapter = useMemo(() => {
    if (!activeLesson) return null;
    return chapters.find((c) => c.id === activeLesson.chapter_id);
  }, [activeLesson, chapters]);

  const canAccessActiveLesson = activeLesson ? (activeLesson.is_free || isEnrolled) : false;

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0c0d0f] text-slate-350">
      
      {/* 1. Left Area: Video Pane & Content Info */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Tabs Menu */}
          <div className="flex items-center bg-[#16161a] p-1.5 rounded-xl border border-zinc-850">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "video"
                  ? "bg-[#0891b2] text-white"
                  : "text-slate-450 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Materi Video
            </button>
            <button
              onClick={() => setActiveTab("tulisan")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "tulisan"
                  ? "bg-[#0891b2] text-white"
                  : "text-slate-450 hover:text-white"
              }`}
            >
              <BookText className="h-3.5 w-3.5" />
              Materi Tulisan
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://discord.gg/koneksiio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#16161a] border border-zinc-850 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#5865F2] fill-current" />
              Join Discord
            </a>

            <button
              disabled={!hasNextVideo}
              onClick={handleNextVideo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0891b2] hover:bg-[#0891b2]/90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-0"
            >
              Video Berikutnya
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-850 shadow-2xl">
          {activeLesson ? (
            activeTab === "video" ? (
              canAccessActiveLesson ? (
                <YoutubePlayer id={activeLesson.youtube_id} title={activeLesson.title} />
              ) : (
                /* Locked Video Overlay */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-950/95 text-center z-20">
                  <div className="bg-amber-500/10 text-amber-400 p-4 rounded-full mb-4 border border-amber-500/20">
                    <Lock className="h-10 w-10 stroke-[2]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading mb-1.5">
                    Materi Ini Terkunci
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                    Dapatkan akses penuh ke modul pembelajaran ini untuk membuka seluruh video, kuis, dan forum diskusi.
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/checkout/${theme.slug}`}>
                      <Button className="bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-extrabold px-6 h-11 rounded-xl shadow-lg shadow-[#0891b2]/20 font-heading border-0 cursor-pointer text-xs">
                        Beli Akses Penuh
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            ) : (
              /* Materi Tulisan Pane */
              <div className="absolute inset-0 overflow-y-auto p-6 md:p-8 bg-zinc-950/90 text-left">
                <div className="max-w-3xl mx-auto prose prose-invert">
                  <span className="text-[#0891b2] text-[10px] font-extrabold uppercase tracking-widest bg-[#0891b2]/10 px-2.5 py-0.5 rounded">
                    {activeChapter?.title}
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-white mt-3 mb-4 leading-tight border-b border-zinc-800 pb-3">
                    {activeLesson.title}
                  </h1>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {activeLesson.description || "Tidak ada materi tulisan untuk bagian ini. Silakan tonton video penjelasannya."}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <BookOpen className="h-12 w-12 text-zinc-700 mb-3" />
              <p className="text-slate-450 text-xs font-semibold">Pilih materi di kurikulum untuk mulai belajar.</p>
            </div>
          )}
        </div>

        {/* Video Info (Only shown if active tab is video) */}
        {activeLesson && activeTab === "video" && (
          <div className="bg-[#16161a] border border-zinc-850 rounded-2xl p-6 text-left space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[#0891b2] text-xs font-bold uppercase tracking-wider">
                {activeChapter?.title}
              </span>
              <h2 className="text-lg md:text-2xl font-bold text-white font-heading leading-tight">
                {activeLesson.title}
              </h2>
            </div>
            
            <div className="h-px bg-zinc-800/60 w-full" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Deskripsi Materi</h4>
              <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">
                {activeLesson.description || "Tidak ada deskripsi untuk materi ini."}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 2. Right Area: Curriculum Sidebar */}
      <aside className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-850 bg-[#0a0a0c] flex flex-col h-auto lg:h-full lg:max-h-screen">
        
        {/* Course Title Area */}
        <div className="p-5 border-b border-zinc-850 text-left space-y-4">
          <Link 
            href="/katalog"
            className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ChevronRight className="h-3 w-3 mr-0.5 rotate-180" />
            Kembali ke Katalog
          </Link>
          
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug font-heading">
            {theme.title}
          </h2>

          {/* If user is not enrolled, show purchase CTA */}
          {!isEnrolled && (
            <Link href={`/checkout/${theme.slug}`} className="block w-full">
              <Button className="w-full bg-[#0891b2] hover:bg-[#0891b2]/95 text-white font-extrabold text-xs h-10 rounded-xl shadow-lg shadow-[#0891b2]/10 font-heading border-0 cursor-pointer transition-transform active:scale-98">
                Beli Akses Penuh — Rp {theme.price_lifetime.toLocaleString("id-ID")}
              </Button>
            </Link>
          )}

          {isEnrolled && (
            <button className="flex items-center justify-center gap-1.5 w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold text-xs h-10 rounded-xl cursor-default">
              <CheckCircle2 className="h-4 w-4" />
              Anda Memiliki Kelas Ini
            </button>
          )}
        </div>

        {/* Chapters list area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chapters.map((chapter, chapterIndex) => {
            const isCollapsed = collapsedChapters[chapter.id];
            
            return (
              <div key={chapter.id} className="border border-zinc-850 rounded-xl overflow-hidden bg-[#16161a]/30">
                {/* Chapter Header Toggle */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex items-center justify-between w-full p-4 hover:bg-zinc-900/50 transition-colors text-left"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Bab {chapterIndex + 1}
                    </span>
                    <span className="font-bold text-sm text-white font-heading leading-tight">
                      {chapter.title}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                </button>

                {/* Lessons list inside chapter */}
                {!isCollapsed && (
                  <div className="border-t border-zinc-850/60 divide-y divide-zinc-850 bg-[#16161a]/60">
                    {chapter.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isCompleted = completedLessonIds.has(lesson.id);
                      const isFree = lesson.is_free;
                      const canAccess = isFree || isEnrolled;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-start justify-between gap-3 p-3.5 hover:bg-zinc-900/50 transition-colors cursor-pointer text-left ${
                            isActive ? "bg-zinc-900/80 border-l-2 border-[#0891b2]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Access/Play indicator icon */}
                            <div className="mt-0.5 shrink-0">
                              {canAccess ? (
                                <Play className={`h-3.5 w-3.5 ${isActive ? "text-[#0891b2] fill-[#0891b2]" : "text-zinc-500"}`} />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-zinc-650" />
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={`text-xs font-semibold leading-relaxed ${
                                isActive ? "text-[#0891b2] font-bold" : "text-slate-300"
                              }`}>
                                {lesson.title}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {lesson.duration && (
                                  <span className="text-[10px] font-mono text-zinc-550">
                                    {lesson.duration}
                                  </span>
                                )}
                                {isFree && !isEnrolled && (
                                  <span className="text-[9px] font-extrabold text-[#0891b2] bg-[#0891b2]/10 px-1 py-0.2 rounded uppercase tracking-wider">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Completion checkbox or Lock icon */}
                          <div className="shrink-0">
                            {canAccess ? (
                              <button
                                onClick={(e) => toggleCompletion(lesson.id, e)}
                                disabled={!userId || !isEnrolled}
                                className={`flex items-center justify-center h-4.5 w-4.5 rounded border transition-colors ${
                                  isCompleted
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-zinc-700 hover:border-[#0891b2] text-transparent"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </button>
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </aside>
    </div>
  );
}
