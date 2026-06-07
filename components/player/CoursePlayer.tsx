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
  BookText,
  Award
} from "lucide-react";
import { YoutubePlayer } from "./YoutubePlayer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { claimCertificate } from "@/app/(dashboard)/dashboard/certificates/actions";

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
  discount?: number | null;
}

interface CoursePlayerProps {
  theme: Theme;
  chapters: Chapter[];
  isEnrolled: boolean;
  initialCompletedLessonIds: string[];
  userId: string | null;
  initialActiveLessonId?: string | null;
  initialCertificateId?: string | null;
}

export function CoursePlayer({
  theme,
  chapters,
  isEnrolled,
  initialCompletedLessonIds,
  userId,
  initialActiveLessonId,
  initialCertificateId
}: CoursePlayerProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [certificateId, setCertificateId] = useState<string | null>(initialCertificateId || null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );

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
  
  // Chapter collapse state map
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const completedCount = useMemo(() => {
    return allLessons.filter(l => completedLessonIds.has(l.id)).length;
  }, [allLessons, completedLessonIds]);

  const progressPercentage = useMemo(() => {
    return allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  }, [allLessons, completedCount]);

  const isThemeCompleted = useMemo(() => {
    return allLessons.length > 0 && allLessons.every(l => completedLessonIds.has(l.id));
  }, [allLessons, completedLessonIds]);

  const handleClaimCertificate = async () => {
    if (!userId) {
      toast.error("Anda harus masuk terlebih dahulu.");
      return;
    }
    setIsClaiming(true);
    try {
      const res = await claimCertificate(theme.id);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.certificateId) {
        setCertificateId(res.certificateId);
        toast.success("Selamat! Sertifikat Anda berhasil diterbitkan! 🎓🎉");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat mengklaim sertifikat.");
    } finally {
      setIsClaiming(false);
    }
  };

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
        const isNowCompleted = allLessons.length > 0 && allLessons.every(l => updated.has(l.id));
        if (isNowCompleted) {
          toast.success("Selamat! Anda telah menyelesaikan seluruh materi kelas ini! 🎓🎉", {
            duration: 8000,
          });
        }
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
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 text-slate-600">
      
      {/* 1. Left Area: Video Pane & Content Info */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Tabs Menu */}
          <div className="flex items-center bg-slate-200/50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "video"
                  ? "bg-[#0891b2] text-white"
                  : "text-slate-500 hover:text-slate-800"
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
                  : "text-slate-500 hover:text-slate-800"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50/50 font-bold text-xs rounded-xl shadow-sm transition-all"
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
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
          {activeLesson ? (
            activeTab === "video" ? (
              canAccessActiveLesson ? (
                <YoutubePlayer id={activeLesson.youtube_id} title={activeLesson.title} />
              ) : (
                /* Locked Video Overlay */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/95 text-center z-20">
                  <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4 border border-amber-200">
                    <Lock className="h-10 w-10 stroke-[2]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading mb-1.5">
                    Materi Ini Terkunci
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
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
              <div className="absolute inset-0 overflow-y-auto p-6 md:p-8 bg-white text-left">
                <div className="max-w-3xl mx-auto prose">
                  <span className="text-[#0891b2] text-[10px] font-extrabold uppercase tracking-widest bg-[#0891b2]/10 px-2.5 py-0.5 rounded">
                    {activeChapter?.title}
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-3 mb-4 leading-tight border-b border-slate-200 pb-3">
                    {activeLesson.title}
                  </h1>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {activeLesson.description || "Tidak ada materi tulisan untuk bagian ini. Silakan tonton video penjelasannya."}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <BookOpen className="h-12 w-12 text-slate-350 mb-3" />
              <p className="text-slate-400 text-xs font-semibold">Pilih materi di kurikulum untuk mulai belajar.</p>
            </div>
          )}
        </div>

        {/* Video Info (Only shown if active tab is video) */}
        {activeLesson && activeTab === "video" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[#0891b2] text-xs font-bold uppercase tracking-wider">
                {activeChapter?.title}
              </span>
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 font-heading leading-tight">
                {activeLesson.title}
              </h2>
            </div>
            
            <div className="h-px bg-slate-150 w-full" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Materi</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activeLesson.description || "Tidak ada deskripsi untuk materi ini."}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 2. Right Area: Curriculum Sidebar */}
      <aside className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col h-auto lg:h-full lg:max-h-screen">
        
        {/* Course Title Area */}
        <div className="p-5 border-b border-slate-200 text-left space-y-4">
          <Link 
            href="/katalog"
            className="inline-flex items-center text-[10px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-wider transition-colors"
          >
            <ChevronRight className="h-3 w-3 mr-0.5 rotate-180" />
            Kembali ke Katalog
          </Link>
          
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-heading">
            {theme.title}
          </h2>

          {/* If user is not enrolled, show purchase CTA */}
          {!isEnrolled && (
            <Link href={`/checkout/${theme.slug}`} className="block w-full">
              <Button className="w-full bg-[#0891b2] hover:bg-[#0891b2]/95 text-white font-extrabold text-xs h-10 rounded-xl shadow-lg shadow-[#0891b2]/10 font-heading border-0 cursor-pointer transition-transform active:scale-98">
                Beli Akses Penuh — Rp {(theme.price_lifetime - (theme.discount ?? 0)).toLocaleString("id-ID")}
              </Button>
            </Link>
          )}

          {isEnrolled && (
            <div className="space-y-4 w-full text-left">
              {/* Progress and Completion indicators */}
              {isThemeCompleted ? (
                certificateId ? (
                  <Link href={`/certificates/${certificateId}`} target="_blank" className="block w-full">
                    <Button className="w-full bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-extrabold text-xs h-10 rounded-xl shadow-lg shadow-[#0891b2]/10 font-heading border-0 cursor-pointer flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 animate-bounce" />
                      Lihat Sertifikat Anda 🎓
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleClaimCertificate}
                    disabled={isClaiming}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-lg shadow-emerald-600/10 font-heading border-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Award className="h-4 w-4 animate-pulse" />
                    {isClaiming ? "Memproses..." : "Klaim Sertifikat Anda 🎓"}
                  </Button>
                )
              ) : (
                <button className="flex items-center justify-center gap-1.5 w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs h-10 rounded-xl cursor-default">
                  <CheckCircle2 className="h-4 w-4" />
                  Anda Memiliki Kelas Ini
                </button>
              )}

              {/* Progress Bar Widget */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Progres Belajar</span>
                  <span>{progressPercentage}% ({completedCount}/{allLessons.length})</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapters list area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chapters.map((chapter, chapterIndex) => {
            const isCollapsed = collapsedChapters[chapter.id];
            
            return (
              <div key={chapter.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {/* Chapter Header Toggle */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex items-center justify-between w-full p-4 hover:bg-slate-100/60 transition-colors text-left"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Bab {chapterIndex + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-800 font-heading leading-tight">
                      {chapter.title}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                </button>

                {/* Lessons list inside chapter */}
                {!isCollapsed && (
                  <div className="border-t border-slate-200/60 divide-y divide-slate-100 bg-white">
                    {chapter.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isCompleted = completedLessonIds.has(lesson.id);
                      const isFree = lesson.is_free;
                      const canAccess = isFree || isEnrolled;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-start justify-between gap-3 p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer text-left ${
                            isActive ? "bg-slate-50 border-l-2 border-[#0891b2]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Access/Play indicator icon */}
                            <div className="mt-0.5 shrink-0">
                              {canAccess ? (
                                <Play className={`h-3.5 w-3.5 ${isActive ? "text-[#0891b2] fill-[#0891b2]" : "text-slate-400"}`} />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={`text-xs font-semibold leading-relaxed ${
                                isActive ? "text-[#0891b2] font-bold" : "text-slate-700"
                              }`}>
                                {lesson.title}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {lesson.duration && (
                                  <span className="text-[10px] font-mono text-slate-400">
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
                                    : "border-slate-300 hover:border-[#0891b2] text-transparent"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </button>
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-slate-400" />
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
