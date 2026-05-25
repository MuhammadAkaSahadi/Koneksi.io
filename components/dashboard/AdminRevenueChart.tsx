"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

// Dummy data for different ranges
const data7Days = [
  { name: "Senin", pendapatan: 1500000, registrasi: 12 },
  { name: "Selasa", pendapatan: 2450000, registrasi: 18 },
  { name: "Rabu", pendapatan: 950000, registrasi: 8 },
  { name: "Kamis", pendapatan: 3100000, registrasi: 25 },
  { name: "Jumat", pendapatan: 1800000, registrasi: 14 },
  { name: "Sabtu", pendapatan: 4500000, registrasi: 32 },
  { name: "Minggu", pendapatan: 2900000, registrasi: 21 },
];

const data30Days = [
  { name: "Minggu 1", pendapatan: 12450000, registrasi: 84 },
  { name: "Minggu 2", pendapatan: 18900000, registrasi: 110 },
  { name: "Minggu 3", pendapatan: 15200000, registrasi: 92 },
  { name: "Minggu 4", pendapatan: 24150000, registrasi: 165 },
];

const data90Days = [
  { name: "Bulan Lalu", pendapatan: 45800000, registrasi: 310 },
  { name: "Bulan Ini", pendapatan: 70700000, registrasi: 451 },
  { name: "Estimasi Depan", pendapatan: 85200000, registrasi: 520 },
];

const data1Year = [
  { name: "Jan", pendapatan: 28000000, registrasi: 180 },
  { name: "Feb", pendapatan: 32000000, registrasi: 210 },
  { name: "Mar", pendapatan: 41000000, registrasi: 290 },
  { name: "Apr", pendapatan: 38000000, registrasi: 250 },
  { name: "Mei", pendapatan: 52000000, registrasi: 340 },
  { name: "Jun", pendapatan: 68000000, registrasi: 410 },
  { name: "Jul", pendapatan: 71000000, registrasi: 430 },
  { name: "Agu", pendapatan: 83000000, registrasi: 510 },
  { name: "Sep", pendapatan: 79000000, registrasi: 480 },
  { name: "Okt", pendapatan: 95000000, registrasi: 620 },
  { name: "Nov", pendapatan: 104000000, registrasi: 690 },
  { name: "Des", pendapatan: 125000000, registrasi: 850 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] text-white p-4 rounded-xl border border-slate-700 shadow-xl space-y-2 text-xs">
        <p className="font-bold text-slate-300 border-b border-slate-700 pb-1.5">{label}</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1164b8]" />
          <span className="text-slate-400">Pendapatan:</span>
          <span className="font-extrabold text-[#93c5fd]">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0
            }).format(payload[0].value)}
          </span>
        </div>
        {payload[1] && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#b1de01]" />
            <span className="text-slate-400">Registrasi:</span>
            <span className="font-extrabold text-[#d9f99d]">
              {payload[1].value} User Baru
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function AdminRevenueChart() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const getChartData = () => {
    switch (range) {
      case "7d":
        return data7Days;
      case "30d":
        return data30Days;
      case "90d":
        return data90Days;
      case "1y":
        return data1Year;
      default:
        return data30Days;
    }
  };

  const formatYAxisLeft = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
    return `Rp ${value}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col h-[450px]">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-heading">
            Grafik Pendapatan & Registrasi
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis data omzet keuangan dan pendaftaran pengguna baru
          </p>
        </div>

        {/* Time filters */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          {[
            { id: "7d", label: "7 Hari" },
            { id: "30d", label: "30 Hari" },
            { id: "90d", label: "90 Hari" },
            { id: "1y", label: "1 Tahun" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                range === item.id
                  ? "bg-[#1164b8] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={getChartData()} margin={{ top: 10, right: -5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1164b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1164b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            {/* Left Y-axis (Revenue) */}
            <YAxis
              yAxisId="left"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisLeft}
              dx={-5}
            />
            {/* Right Y-axis (Registrasi) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val} user`}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
            
            {/* Revenue Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="pendapatan"
              stroke="#1164b8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            
            {/* Registration Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="registrasi"
              stroke="#b1de01"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, stroke: "#b1de01", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
