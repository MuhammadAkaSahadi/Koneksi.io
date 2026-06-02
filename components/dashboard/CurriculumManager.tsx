"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Video, 
  Layers, 
  Loader2, 
  PlayCircle, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock, 
  X 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

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
  lessons?: Lesson[];
  created_at: string;
}

interface Theme {
  id: string;
  title: string;
  slug: string;
}

interface CurriculumManagerProps {
  theme: Theme;
  initialChapters: Chapter[];
}

export function CurriculumManager({ theme, initialChapters }: CurriculumManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [isLoading, setIsLoading] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");

  // Lesson Modal states
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);

  // Lesson Form states
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Helper function to extract YouTube ID from URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // If it's already just an ID (11 characters, alphanumeric with _ and -)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    return null;
  };

  // Chapter operations
  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    setChapterTitle("");
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) {
      toast.error("Nama modul tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    if (editingChapter) {
      // Update chapter
      const { error } = await supabase
        .from("chapters")
        .update({ title: chapterTitle })
        .eq("id", editingChapter.id);

      if (error) {
        toast.error(`Gagal mengubah modul: ${error.message}`);
      } else {
        toast.success("Modul berhasil diperbarui");
        setChapters((prev) =>
          prev.map((c) => (c.id === editingChapter.id ? { ...c, title: chapterTitle } : c))
        );
        setIsChapterModalOpen(false);
      }
    } else {
      // Add chapter
      const maxOrder = chapters.reduce((max, c) => Math.max(max, c.order_index), 0);
      const newChapterPayload = {
        theme_id: theme.id,
        title: chapterTitle,
        order_index: maxOrder + 1,
      };

      const { data, error } = await supabase
        .from("chapters")
        .insert([newChapterPayload])
        .select();

      if (error) {
        toast.error(`Gagal menambah modul: ${error.message}`);
      } else if (data && data[0]) {
        toast.success("Modul baru berhasil ditambahkan");
        setChapters((prev) => [...prev, { ...data[0], lessons: [] }]);
        setIsChapterModalOpen(false);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus modul ini beserta seluruh materi di dalamnya?")) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);

    if (error) {
      toast.error(`Gagal menghapus modul: ${error.message}`);
    } else {
      toast.success("Modul berhasil dihapus");
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    }
    setIsLoading(false);
  };

  const handleMoveChapter = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const list = [...chapters];
    const current = list[index];
    const target = list[targetIndex];

    // Swap order_index in state
    const currentOrder = current.order_index;
    current.order_index = target.order_index;
    target.order_index = currentOrder;

    // Swap positions in list
    list[index] = target;
    list[targetIndex] = current;

    // Update in UI immediately
    setChapters(list);

    // Save to DB
    const { error: err1 } = await supabase
      .from("chapters")
      .update({ order_index: current.order_index })
      .eq("id", current.id);

    const { error: err2 } = await supabase
      .from("chapters")
      .update({ order_index: target.order_index })
      .eq("id", target.id);

    if (err1 || err2) {
      toast.error("Gagal menyimpan perubahan urutan di database");
    }
  };

  // Lesson operations
  const handleOpenAddLesson = (chapterId: string) => {
    setTargetChapterId(chapterId);
    setEditingLesson(null);
    setLessonTitle("");
    setLessonYoutubeUrl("");
    setLessonDuration("");
    setLessonDescription("");
    setLessonIsFree(false);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setTargetChapterId(lesson.chapter_id);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    // Construct YouTube URL from stored ID for editing
    setLessonYoutubeUrl(`https://www.youtube.com/watch?v=${lesson.youtube_id}`);
    setLessonDuration(lesson.duration || "");
    setLessonDescription(lesson.description || "");
    setLessonIsFree(lesson.is_free);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      toast.error("Judul materi tidak boleh kosong");
      return;
    }
    if (!lessonYoutubeUrl.trim()) {
      toast.error("Link YouTube tidak boleh kosong");
      return;
    }

    // Extract YouTube ID from URL
    const youtubeId = extractYouTubeId(lessonYoutubeUrl);
    if (!youtubeId) {
      toast.error("Link YouTube tidak valid. Pastikan Anda memasukkan URL YouTube yang benar.");
      return;
    }

    if (!targetChapterId) return;

    setIsLoading(true);

    const payload = {
      title: lessonTitle,
      youtube_id: youtubeId,
      duration: lessonDuration.trim() || null,
      description: lessonDescription.trim() || null,
      is_free: lessonIsFree,
    };

    if (editingLesson) {
      // Update lesson
      const { error } = await supabase
        .from("lessons")
        .update(payload)
        .eq("id", editingLesson.id);

      if (error) {
        toast.error(`Gagal mengubah materi: ${error.message}`);
      } else {
        toast.success("Materi berhasil diperbarui");
        setChapters((prev) =>
          prev.map((c) => {
            if (c.id === targetChapterId && c.lessons) {
              return {
                ...c,
                lessons: c.lessons.map((l) => (l.id === editingLesson.id ? { ...l, ...payload } : l)),
              };
            }
            return c;
          })
        );
        setIsLessonModalOpen(false);
      }
    } else {
      // Add lesson
      const chapter = chapters.find((c) => c.id === targetChapterId);
      const maxOrder = chapter?.lessons?.reduce((max, l) => Math.max(max, l.order_index), 0) || 0;

      const newLessonPayload = {
        chapter_id: targetChapterId,
        order_index: maxOrder + 1,
        ...payload
      };

      const { data, error } = await supabase
        .from("lessons")
        .insert([newLessonPayload])
        .select();

      if (error) {
        toast.error(`Gagal menambah materi: ${error.message}`);
      } else if (data && data[0]) {
        toast.success("Materi baru berhasil ditambahkan");
        setChapters((prev) =>
          prev.map((c) => {
            if (c.id === targetChapterId) {
              return {
                ...c,
                lessons: [...(c.lessons || []), data[0]],
              };
            }
            return c;
          })
        );
        setIsLessonModalOpen(false);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

    if (error) {
      toast.error(`Gagal menghapus materi: ${error.message}`);
    } else {
      toast.success("Materi berhasil dihapus");
      setChapters((prev) =>
        prev.map((c) => {
          if (c.id === chapterId && c.lessons) {
            return {
              ...c,
              lessons: c.lessons.filter((l) => l.id !== lessonId),
            };
          }
          return c;
        })
      );
    }
    setIsLoading(false);
  };

  const handleMoveLesson = async (chapterId: string, index: number, direction: "up" | "down") => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter || !chapter.lessons) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapter.lessons.length) return;

    const list = [...chapter.lessons];
    const current = list[index];
    const target = list[targetIndex];

    // Swap order_index
    const currentOrder = current.order_index;
    current.order_index = target.order_index;
    target.order_index = currentOrder;

    // Swap positions
    list[index] = target;
    list[targetIndex] = current;

    // Update state
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, lessons: list } : c))
    );

    // Save to DB
    const { error: err1 } = await supabase
      .from("lessons")
      .update({ order_index: current.order_index })
      .eq("id", current.id);

    const { error: err2 } = await supabase
      .from("lessons")
      .update({ order_index: target.order_index })
      .eq("id", target.id);

    if (err1 || err2) {
      toast.error("Gagal menyimpan perubahan urutan materi di database");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <a 
          href="/admin/courses"
          className="flex items-center gap-1 text-sm font-semibold text-slate-650 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Kurikulum
        </a>
        <button
          onClick={handleOpenAddChapter}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 text-white font-extrabold text-xs rounded-lg transition-colors shadow-sm font-heading"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Tambah Modul Baru
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-left">
        <h2 className="text-xl font-extrabold text-slate-800 font-heading">
          Struktur Kurikulum: {theme.title}
        </h2>
        <p className="text-xs text-slate-400 -mt-4">
          Kelola urutan modul dan isi materi video pembelajaran. Pastikan setidaknya 2 materi pertama diatur gratis (`is_free = true`) untuk fitur freemium.
        </p>

        {/* Chapters container */}
        <div className="space-y-6">
          {chapters.length > 0 ? (
            chapters.map((chapter, chapterIndex) => (
              <div 
                key={chapter.id} 
                className="border border-slate-250 rounded-xl overflow-hidden shadow-sm bg-slate-50/50"
              >
                
                {/* Chapter Header */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-250 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Layers className="h-4.5 w-4.5 text-[#1164b8]" />
                    <span className="font-bold text-slate-850 text-base font-heading">
                      Modul {chapterIndex + 1}: {chapter.title}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {chapter.lessons?.length || 0} Materi
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Chapter Reorder Buttons */}
                    <button
                      disabled={chapterIndex === 0}
                      onClick={() => handleMoveChapter(chapterIndex, "up")}
                      className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      title="Pindahkan Ke Atas"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      disabled={chapterIndex === chapters.length - 1}
                      onClick={() => handleMoveChapter(chapterIndex, "down")}
                      className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      title="Pindahkan Ke Bawah"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    
                    <div className="h-4 w-px bg-slate-300 mx-1"></div>

                    {/* Edit Chapter */}
                    <button
                      onClick={() => handleOpenEditChapter(chapter)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-650 hover:bg-slate-200/80 rounded transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Ubah Judul
                    </button>

                    {/* Delete Chapter */}
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-650 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus Modul
                    </button>
                  </div>
                </div>

                {/* Lessons list inside chapter */}
                <div className="p-4 space-y-3 bg-white">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div 
                          key={lesson.id} 
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <PlayCircle className="h-5 w-5 text-slate-400 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-800 text-sm truncate">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-slate-400">
                                  ID: {lesson.youtube_id}
                                </span>
                                {lesson.duration && (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {lesson.duration}
                                  </span>
                                )}
                                {lesson.is_free ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-55 border border-emerald-100 px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                                    <Unlock className="h-2.5 w-2.5 stroke-[2.5]" />
                                    Free Preview
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                                    <Lock className="h-2.5 w-2.5" />
                                    Premium
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Lesson Reorder */}
                            <button
                              disabled={lessonIndex === 0}
                              onClick={() => handleMoveLesson(chapter.id, lessonIndex, "up")}
                              className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Pindahkan Ke Atas"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={lessonIndex === (chapter.lessons?.length || 0) - 1}
                              onClick={() => handleMoveLesson(chapter.id, lessonIndex, "down")}
                              className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Pindahkan Ke Bawah"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            
                            <div className="h-4 w-px bg-slate-200 mx-1"></div>

                            {/* Edit Lesson */}
                            <button
                              onClick={() => handleOpenEditLesson(lesson)}
                              className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-[#1164b8] rounded transition-colors"
                              title="Ubah Materi"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Delete Lesson */}
                            <button
                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-650 rounded transition-colors"
                              title="Hapus Materi"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-250 rounded-lg">
                      <p className="text-xs">Belum ada materi pembelajaran dalam modul ini.</p>
                    </div>
                  )}

                  {/* Add Lesson button */}
                  <button
                    onClick={() => handleOpenAddLesson(chapter.id)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg transition-colors cursor-pointer w-full justify-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Materi Video
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm font-heading">Belum Ada Modul</h3>
              <p className="text-slate-400 text-xs mt-1 mb-4">
                Silakan buat modul pembelajaran pertama Anda untuk kurikulum ini.
              </p>
              <button
                onClick={handleOpenAddChapter}
                className="px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 text-white font-extrabold text-xs rounded-lg transition-all"
              >
                Buat Modul Pertama
              </button>
            </div>
          )}
        </div>

      </div>

      {/* CHAPTER MODAL */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-heading">
                {editingChapter ? "Ubah Judul Modul" : "Tambah Modul Baru"}
              </h3>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama / Judul Modul</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengenalan IoT & ESP32"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg shadow-sm font-heading cursor-pointer transition-colors"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON MODAL */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-heading">
                {editingLesson ? "Ubah Materi Video" : "Tambah Materi Video Baru"}
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              {/* Judul */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Instalasi Arduino IDE & Setup Driver"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                />
              </div>

              {/* Grid: YouTube URL & Duration */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Link Video YouTube</label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=gfGbcVb4Kzo"
                    value={lessonYoutubeUrl}
                    onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                  />
                  <p className="text-[10px] text-slate-400">Salin dan tempel link lengkap video YouTube Anda.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Durasi Video</label>
                  <input
                    type="text"
                    placeholder="Contoh: 24:58 atau 05:43"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                  />
                  <p className="text-[10px] text-slate-400">Format MM:SS atau HH:MM:SS</p>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi / Materi Tulis</label>
                <textarea
                  rows={4}
                  placeholder="Tulis ringkasan materi, tautan unduhan driver, atau kode contoh di sini. Mendukung pemisahan baris..."
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8] resize-none"
                />
              </div>

              {/* Checkbox Freemium */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={lessonIsFree}
                    onChange={(e) => setLessonIsFree(e.target.checked)}
                    className="text-[#1164b8] focus:ring-[#1164b8] h-4.5 w-4.5 border-slate-300 rounded"
                  />
                  <span>Jadikan materi ini GRATIS (Free Preview)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-1 pl-7">
                  Jika diaktifkan, pengguna yang belum membeli kurikulum ini tetap dapat mengakses dan menonton video/tulisan materi ini.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg shadow-sm font-heading cursor-pointer transition-colors"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
