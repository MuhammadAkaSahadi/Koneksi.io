"use client";

import React, { useEffect, useState } from "react";
import { Package, Layers, Clock, Award } from "lucide-react";

interface StatsWidgetGridProps {
  stats: {
    packageStatus: "lifetime" | "subscription" | "trial" | "expired";
    totalClasses: number;
    inProgressClasses: number;
    certificatesCount: number;
  };
}

export function StatsWidgetGrid({ stats }: StatsWidgetGridProps) {
  const [animatedValues, setAnimatedValues] = useState({
    total: 0,
    progress: 0,
    certs: 0
  });

  useEffect(() => {
    const duration = 1000; // 1s
    const steps = 25;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setAnimatedValues({
        total: Math.floor((stats.totalClasses || 0) * (currentStep / steps)),
        progress: Math.floor((stats.inProgressClasses || 0) * (currentStep / steps)),
        certs: Math.floor((stats.certificatesCount || 0) * (currentStep / steps))
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues({
          total: stats.totalClasses,
          progress: stats.inProgressClasses,
          certs: stats.certificatesCount
        });
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [stats]);

  const getPackageBadge = (status: "lifetime" | "subscription" | "trial" | "expired") => {
    switch (status) {
      case "lifetime":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold bg-[#0891b2]/10 text-[#0891b2] border border-[#0891b2]/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Akses Lifetime
          </span>
        );
      case "subscription":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold bg-[#0891b2]/10 text-[#0891b2] border border-[#0891b2]/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Langganan Aktif
          </span>
        );
      case "trial":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Akun Trial
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Telah Berakhir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider">
            Trial
          </span>
        );
    }
  };

  const getPackageSubText = (status: "lifetime" | "subscription" | "trial" | "expired") => {
    switch (status) {
      case "lifetime":
        return "Akses penuh selamanya";
      case "subscription":
        return "Bisa akses semua modul";
      case "trial":
        return "Akses terbatas 2 bab gratis";
      case "expired":
        return "Silakan perbarui paket Anda";
      default:
        return "Masa percobaan aktif";
    }
  };

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
      {/* CARD 1: Status Paket */}
      <div className="bg-[#16161a] rounded-2xl border border-zinc-850 p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:border-zinc-700/60 hover:shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-550 tracking-wide uppercase font-heading">
              Status Paket
            </span>
            <div className="pt-1">{getPackageBadge(stats.packageStatus)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-800/60 text-zinc-400 shrink-0">
            <Package className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-450 font-medium">
          {getPackageSubText(stats.packageStatus)}
        </div>
      </div>

      {/* CARD 2: Total Kelas */}
      <div className="bg-[#16161a] rounded-2xl border border-zinc-850 p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:border-zinc-700/60 hover:shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 tracking-wide uppercase font-heading">
              Total Kelas
            </span>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              {animatedValues.total}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-450 font-medium">
          Materi kelas aktif untuk belajar
        </div>
      </div>

      {/* CARD 3: Sedang Berjalan */}
      <div className="bg-[#16161a] rounded-2xl border border-zinc-850 p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:border-zinc-700/60 hover:shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 tracking-wide uppercase font-heading">
              Sedang Berjalan
            </span>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              {animatedValues.progress}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-450 font-medium font-heading">
          Modul kelas dalam progres
        </div>
      </div>

      {/* CARD 4: Sertifikat */}
      <div className="bg-[#16161a] rounded-2xl border border-zinc-850 p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:border-zinc-700/60 hover:shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 tracking-wide uppercase font-heading">
              Sertifikat
            </span>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              {animatedValues.certs}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-450 font-medium font-heading">
          {stats.certificatesCount > 0 ? "Sertifikat siap diunduh" : "Selesaikan modul kelas"}
        </div>
      </div>
    </div>
  );
}
