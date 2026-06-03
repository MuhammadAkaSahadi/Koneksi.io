"use client";

import React from "react";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

interface ThemeItem {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price_lifetime: number;
}

interface ExploreModulesProps {
  themes: ThemeItem[];
}

export function ExploreModules({ themes }: ExploreModulesProps) {
  const getCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("esp32") || t.includes("hardware") || t.includes("arduino")) {
      return "Hardware (IoT)";
    }
    if (t.includes("cloud") || t.includes("sensor") || t.includes("monitoring")) {
      return "IoT Cloud / Web";
    }
    if (t.includes("smart home") || t.includes("assistant")) {
      return "Smart Home";
    }
    return "IoT Programming";
  };

  const getDurationMeta = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("esp32")) return "8 Bab • 24 Materi";
    if (t.includes("industri")) return "6 Bab • 18 Materi";
    if (t.includes("arduino")) return "5 Bab • 15 Materi";
    return "4 Bab • 12 Materi";
  };

  const formatCurrency = (val: number) => {
    if (Number(val) === 0) return "GRATIS / FREE";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!themes || themes.length === 0) {
    return null; // Don't render the section if no other themes are found
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Eksplorasi Modul Lainnya
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dapatkan akses penuh ke modul IoT terapan buatan pakar industri
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const category = getCategory(theme.title);
          const meta = getDurationMeta(theme.title);

          return (
            <div
              key={theme.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-slate-350"
            >
              <div>
                {/* 1. Thumbnail Area with Overlay badge */}
                <div className="relative aspect-video bg-slate-50 overflow-hidden border-b border-slate-100">
                  {theme.thumbnail_url ? (
                    <img
                      src={theme.thumbnail_url}
                      alt={theme.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-[#0891b2] text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Rekomendasi
                  </span>
                </div>

                {/* 2. Content Area */}
                <div className="p-5 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-[#0891b2] uppercase tracking-wider">
                    {category}
                  </span>
                  
                  <h4 className="text-[15px] font-bold text-slate-800 font-heading leading-snug line-clamp-2 group-hover:text-[#0891b2] transition-colors">
                    {theme.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{meta}</span>
                  </div>
                </div>
              </div>

              {/* 3. Footer Price & CTA */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Investasi Belajar
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-heading">
                    {formatCurrency(Number(theme.price_lifetime))}
                  </span>
                </div>

                <Link href={`/katalog/${theme.slug}`}>
                  <button className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-[#0891b2] text-slate-500 hover:text-white flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-sm cursor-pointer border-0">
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
