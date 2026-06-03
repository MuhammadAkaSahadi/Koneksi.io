"use client";

import { DollarSign, Users, RefreshCw, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AdminMetricsGridProps {
  metrics: {
    revenueThisMonth: number;
    transactionCount: number;
    totalUsers: number;
    newUsersThisWeek: number;
    activeSubscriptions: number;
    pendingTransactions: number;
  };
}

export function AdminMetricsGrid({ metrics }: AdminMetricsGridProps) {
  // Simple CountUp animation simulation
  const [counts, setCounts] = useState({
    revenue: 0,
    users: 0,
    subs: 0,
    pending: 0
  });

  useEffect(() => {
    const duration = 1200; // 1.2s
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setCounts({
        revenue: Math.floor((metrics.revenueThisMonth || 0) * (step / steps)),
        users: Math.floor((metrics.totalUsers || 0) * (step / steps)),
        subs: Math.floor((metrics.activeSubscriptions || 0) * (step / steps)),
        pending: Math.floor((metrics.pendingTransactions || 0) * (step / steps))
      });

      if (step >= steps) {
        clearInterval(interval);
        // Ensure exact final numbers are set
        setCounts({
          revenue: metrics.revenueThisMonth || 0,
          users: metrics.totalUsers || 0,
          subs: metrics.activeSubscriptions || 0,
          pending: metrics.pendingTransactions || 0
        });
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [metrics]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(counts.revenue),
      subText: `Dari ${metrics.transactionCount || 0} transaksi sukses`,
      trend: "+15.3%",
      trendDirection: "up",
      icon: DollarSign,
      iconBg: "bg-gradient-to-tr from-[#1164b8] to-[#2563eb] text-white",
      borderHover: "hover:border-[#1164b8]/30"
    },
    {
      title: "Total Pengguna",
      value: counts.users.toLocaleString("id-ID"),
      subText: `+${metrics.newUsersThisWeek || 0} pengguna baru minggu ini`,
      trend: `+${metrics.newUsersThisWeek || 0}`,
      trendDirection: "up",
      icon: Users,
      iconBg: "bg-[#1164b8]/10 text-[#1164b8]",
      borderHover: "hover:border-[#1164b8]/30"
    },
    {
      title: "Langganan Aktif",
      value: counts.subs.toLocaleString("id-ID"),
      subText: "Paket langganan aktif saat ini",
      trend: "+8.2%",
      trendDirection: "up",
      icon: RefreshCw,
      iconBg: "bg-purple-500/10 text-purple-600",
      borderHover: "hover:border-[#1164b8]/30"
    },
    {
      title: "Transaksi Pending",
      value: counts.pending.toLocaleString("id-ID"),
      subText: "Menunggu pembayaran/konfirmasi",
      badge: "Perlu Review",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600",
      borderHover: "hover:border-[#1164b8]/30"
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={cn(
              "bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
              card.borderHover
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-heading">
                  {card.title}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                  {card.value}
                </h3>
              </div>
              <div className={cn("p-2.5 rounded-xl shrink-0 shadow-sm", card.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{card.subText}</span>
              {card.trend && (
                <span className="flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3" />
                  {card.trend}
                </span>
              )}
              {card.badge && (
                <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
