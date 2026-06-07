"use client";

import React from "react";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleSalesItem {
  rank: number;
  title: string;
  salesCount: number;
  revenue: number;
  percentage: number;
}

interface AdminTopModulesProps {
  modules?: ModuleSalesItem[];
}

export function AdminTopModules({ modules = [] }: AdminTopModulesProps) {
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
        {modules.length > 0 ? (
          modules.map((module, idx) => (
            <div
              key={`module-${idx}`}
              className="group block p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-100 hover:border-[#1164b8]/30 transition-all duration-200 hover:translate-x-1 shadow-sm hover:shadow-md"
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
                </div>
                <span className="text-xs font-extrabold text-slate-700 font-heading bg-white group-hover:bg-[#1164b8]/5 group-hover:text-[#1164b8] px-2 py-1 rounded border border-slate-150 transition-colors">
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Award className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">Belum ada data penjualan</p>
            <p className="text-xs text-slate-400 mt-1">Data modul terlaris akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}
