"use client";

import React from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface YoutubePlayerProps {
  id: string;
  title: string;
}

export function YoutubePlayer({ id, title }: YoutubePlayerProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-black aspect-video">
      <LiteYouTubeEmbed
        id={id}
        title={title}
        wrapperClass="yt-lite"
        playerClass="lty-playbtn"
      />
    </div>
  );
}
