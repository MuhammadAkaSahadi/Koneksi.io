"use client";

import React, { useState } from "react";
import { PlayCircle, FileVideo, VideoOff } from "lucide-react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

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

interface KatalogVideoPreviewProps {
  freeLessons: Lesson[];
  themePreviewVideoUrl: string | null;
  themeTitle: string;
}

function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return url;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function KatalogVideoPreview({
  freeLessons,
  themePreviewVideoUrl,
  themeTitle,
}: KatalogVideoPreviewProps) {
  // Determine default video info
  const defaultVideo = React.useMemo(() => {
    if (freeLessons.length > 0) {
      const firstFree = freeLessons[0];
      const ytId = getYoutubeId(firstFree.youtube_id);
      if (ytId) {
        return { id: ytId, title: firstFree.title };
      }
    } else if (themePreviewVideoUrl) {
      const ytId = getYoutubeId(themePreviewVideoUrl);
      if (ytId) {
        return { id: ytId, title: "Preview Kelas: " + themeTitle };
      }
    }
    return null;
  }, [freeLessons, themePreviewVideoUrl, themeTitle]);

  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);

  const activeVideo = selectedVideo || defaultVideo;

  if (!activeVideo) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="bg-slate-50 p-4 rounded-full border border-slate-100 mb-3 text-slate-400">
          <VideoOff className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Tidak ada video preview</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FileVideo className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Video Preview - Gratis</h3>
      </div>

      {/* Main Active YouTube Player */}
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200 shadow-sm relative">
        <LiteYouTubeEmbed
          id={activeVideo.id}
          title={activeVideo.title}
          wrapperClass="yt-lite h-full w-full"
          playerClass="lty-playbtn"
        />
      </div>

      <div className="text-xs text-slate-500 font-medium">
        Sedang Diputar: <span className="text-slate-800 font-bold">{activeVideo.title}</span>
      </div>

      {/* Free Lessons Playlist (Only show if there are multiple free lessons) */}
      {freeLessons.length > 1 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Materi Preview Lainnya:</h4>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
            {freeLessons.map((lesson) => {
              const ytId = getYoutubeId(lesson.youtube_id);
              const isActive = ytId === activeVideo.id;
              if (!ytId) return null;

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedVideo({ id: ytId, title: lesson.title });
                  }}
                  className={`w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-lg transition-colors border-0 cursor-pointer ${
                    isActive
                      ? "bg-primary/10 border-l-2 border-primary text-primary"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold truncate">{lesson.title}</span>
                  </div>
                  {lesson.duration && (
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{lesson.duration}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
