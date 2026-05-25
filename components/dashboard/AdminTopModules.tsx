"use client";

import React from "react";
import { Award, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleSalesItem {
  id: string;
  rank: number;
  title: string;
  salesCount: number;
  category: string;
  revenue: number;
  percentage: number;
}

const mockTopModules: ModuleSalesItem[] = [
  {
    id: "m1",
    rank: 1,
    title: "IoT Fundamentals with ESP32 & Supabase",
    salesCount: 184,
    category: "IoT / Hardware",
    revenue: 36616000,
    percentage: 100
  },
  {
    id: "m2",
    rank: 2,
    title: "Sistem Monitoring Sensor IoT Industri",
    salesCount: 125,
    category: "IoT / Cloud",
    revenue: 24875000,
    percentage: 68
  },
  {
    id: "m3",
    rank: 3,
    title: "Dasar Pemrograman Microcontroller dengan Arduino",
    salesCount: 98,
    category: "Hardware / Pemula",
    revenue: 19502000,
    percentage: 53
  },
  {
    id: "m4",
    rank: 4,
    title: "Membangun Smart Home dengan Home Assistant & ESP32",
    salesCount: 72,
    category: "Smart Home",
    revenue: 14328000,
    percentage: 39
  }
];

export function AdminTopModules() {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-sm ring-2 ring-amber-300/30";
      case 2:
        return "bg-gradient-to-tr from-slate-400 to-slate-300 text-white shadow-sm ring-2 ring-slate-300/30";
      case 3:
        return "bg-gradient-to-tr from-amber-700 to-orange-500 text-white shadow-sm ring-2 ring-orange-400/30";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getRankLabel = (rank: number) => {
    if (rank <= 3) return `#${rank}`;
    return `${rank}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col h-[450px]">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 font-heading">
          Modul Terlaris
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Modul kursus terlaris bulan ini berdasarkan volume transaksi
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5">
        {mockTopModules.map((module) => (
          <div
            key={module.id}
            className="group block p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-100 hover:border-[#1164b8]/30 transition-all duration-200 hover:translate-x-1 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            {/* Top Row: Rank & Sales */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex items-center justify-center h-6 w-8 rounded text-xs font-black font-heading",
                  getRankBadgeStyle(module.rank)
                )}>
                  {getRankLabel(module.rank)}
                </span>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {module.category}
                </span>
              </div>
              <span className="text-xs font-extrabold text-slate-700 font-heading bg-white group-hover:bg-[#1164b8]/5 group-hover:text-[#1164b8] px-2 py-1 rounded border border-slate-150 transition-all">
                {module.salesCount} Terjual
              </span>
            </div>

            {/* Title: 2 lines max */}
            <h4 className="text-sm font-bold text-slate-800 font-heading mt-2.5 leading-snug line-clamp-2 group-hover:text-[#1164b8] transition-colors">
              {module.title}
            </h4>

            {/* Meta Row: Revenue & Progress */}
            <div className="mt-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Omset Pendapatan</span>
                <span className="font-extrabold text-emerald-600 font-heading">
                  {formatCurrency(module.revenue)}
                </span>
              </div>

              {/* Progress bar relative to top performer */}
              <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1164b8] to-[#b1de01] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${module.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
