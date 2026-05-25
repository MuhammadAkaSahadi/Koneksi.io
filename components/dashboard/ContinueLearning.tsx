"use client";

import React, { useEffect, useState } from "react";
import { Play, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProgressData {
  themeTitle: string;
  themeSlug: string;
  lessonTitle: string;
  lessonId: string;
  category: string;
  thumbnailUrl: string | null;
  progressPercent: number;
}

interface ContinueLearningProps {
  latestProgress: ProgressData | null;
}

export function ContinueLearning({ latestProgress }: ContinueLearningProps) {
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (latestProgress) {
      const timer = setTimeout(() => {
        setProgressWidth(latestProgress.progressPercent);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [latestProgress]);

  // Render Empty State if no active course progress is found
  if (!latestProgress) {
    return (
      <div className="bg-[#16161a] rounded-2xl border border-zinc-800 p-8 sm:p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center min-h-[240px] transition-all">
        <div className="bg-[#0891b2]/10 p-4 rounded-full text-[#0891b2] mb-4">
          <BookOpen className="h-10 w-10 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-white font-heading mb-1.5">
          Belum Ada Kursus Aktif
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
          Mulai langkah belajarmu hari ini dengan memilih modul IoT & Tech terbaik dari katalog kami.
        </p>
        <Link href="/katalog">
          <Button className="bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-[#0891b2]/20 font-heading border-0 cursor-pointer">
            Jelajahi Katalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Menu Header like in Image 1 */}
      <div className="flex items-center border-b border-zinc-800 pb-2">
        <button className="text-sm font-bold text-white relative px-2 pb-2.5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0891b2] cursor-default">
          Course
        </button>
      </div>

      {/* Grid of Enrolled Courses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Link 
          href={`/player/${latestProgress.themeSlug}/${latestProgress.lessonId}`}
          className="group block bg-[#16161a] border border-zinc-850 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Card Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-850">
            {latestProgress.thumbnailUrl ? (
              <img
                src={latestProgress.thumbnailUrl}
                alt={latestProgress.themeTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-zinc-650" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
              <div className="bg-[#0891b2] text-white p-3.5 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-all duration-300 ease-out">
                <Play className="h-5 w-5 fill-current pl-0.5" />
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-5 flex flex-col gap-3.5">
            {/* Category tag */}
            <span className="text-[10px] font-extrabold text-[#0891b2] bg-[#0891b2]/10 px-2.5 py-0.5 rounded uppercase tracking-wider w-fit">
              {latestProgress.category}
            </span>

            {/* Title */}
            <h3 className="text-[15px] font-bold text-white font-heading leading-snug group-hover:text-[#0891b2] transition-colors line-clamp-2 min-h-[44px]">
              {latestProgress.themeTitle}
            </h3>

            {/* Last read status */}
            <p className="text-xs text-zinc-500 font-semibold truncate">
              Last read: <span className="text-slate-300">{latestProgress.lessonTitle}</span>
            </p>

            {/* Progress Area */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Progress</span>
                <span className="text-[#f59e0b] font-bold">{latestProgress.progressPercent}%</span>
              </div>
              
              {/* Progress bar container */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
