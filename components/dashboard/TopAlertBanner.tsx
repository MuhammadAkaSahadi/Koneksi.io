"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TopAlertBannerProps {
  onClose: () => void;
}

export function TopAlertBanner({ onClose }: TopAlertBannerProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border-b border-[#F59E0B]/20 py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="bg-[#F59E0B]/10 p-1.5 rounded-full shrink-0 text-[#F59E0B]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-[#92400E] truncate">
          Segera lengkapi nama lengkap kamu di pengaturan untuk penerbitan sertifikat resmi Koneksi.io.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={() => router.push("/dashboard/settings")}
          size="sm"
          className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white font-bold text-xs px-3 h-8 rounded-lg shadow-sm border-0"
        >
          Lengkapi Profil
        </Button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#92400E]/5 text-[#92400E] rounded-lg transition-colors"
          aria-label="Tutup peringatan"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
