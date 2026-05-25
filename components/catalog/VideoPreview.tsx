"use client";

import React, { useState } from "react";
import { PlayCircle } from "lucide-react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface VideoPreviewProps {
  thumbnailUrl: string | null;
  youtubeId: string | null;
  title: string;
}

function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  // If it's already a clean 11-char ID
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return url;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPreview({ thumbnailUrl, youtubeId, title }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Resolve the actual youtube ID to play
  const resolvedYoutubeId = getYoutubeId(youtubeId) || getYoutubeId(thumbnailUrl);

  // Resolve the thumbnail image url
  let displayThumbnailUrl = thumbnailUrl;
  const thumbnailYoutubeId = getYoutubeId(thumbnailUrl);
  if (thumbnailYoutubeId) {
    displayThumbnailUrl = `https://img.youtube.com/vi/${thumbnailYoutubeId}/hqdefault.jpg`;
  } else if (!thumbnailUrl && resolvedYoutubeId) {
    displayThumbnailUrl = `https://img.youtube.com/vi/${resolvedYoutubeId}/hqdefault.jpg`;
  }

  if (isPlaying && resolvedYoutubeId) {
    return (
      <div className="aspect-video w-full bg-black">
        <LiteYouTubeEmbed
          id={resolvedYoutubeId}
          title={title}
          wrapperClass="yt-lite h-full w-full"
          playerClass="lty-playbtn"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => {
        if (resolvedYoutubeId) {
          setIsPlaying(true);
        }
      }}
      className="aspect-video relative bg-slate-900 flex items-center justify-center group cursor-pointer"
    >
      {displayThumbnailUrl ? (
        <img 
          src={displayThumbnailUrl} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
        />
      ) : (
        <div className="absolute inset-0 bg-slate-800" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
      </div>
      <div className="absolute top-4 left-4">
        <span className="bg-accent text-accent-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
          Preview Tersedia
        </span>
      </div>
    </div>
  );
}
