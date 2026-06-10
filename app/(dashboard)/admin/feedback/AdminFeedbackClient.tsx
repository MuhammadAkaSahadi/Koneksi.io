"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Eye, 
  Calendar, 
  Mail,
  UserCheck
} from "lucide-react";

interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Feedback {
  id: string;
  type: "kritik" | "saran";
  content: string;
  created_at: string;
  profiles: Profile | null;
}

interface AdminFeedbackClientProps {
  feedbacks: Feedback[];
}

export function AdminFeedbackClient({ feedbacks }: AdminFeedbackClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "saran" | "kritik">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Filtered feedbacks
  const filteredFeedbacks = feedbacks.filter((item) => {
    const name = (item.profiles?.full_name || "").toLowerCase();
    const email = (item.profiles?.email || "").toLowerCase();
    const content = item.content.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      name.includes(search) || 
      email.includes(search) || 
      content.includes(search);

    const matchesType = selectedType === "all" || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const totalCount = feedbacks.length;
  const saranCount = feedbacks.filter((f) => f.type === "saran").length;
  const kritikCount = feedbacks.filter((f) => f.type === "kritik").length;

  const getInitials = (profile: Profile | null) => {
    if (profile?.full_name) {
      return profile.full_name.substring(0, 2).toUpperCase();
    }
    return profile?.email?.substring(0, 2).toUpperCase() || "US";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Kelola Kritik & Saran
        </h1>
        <p className="text-slate-500 text-sm">
          Baca masukan, saran fitur, dan keluhan yang dikirimkan oleh pengguna platform Koneksi.io.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Feedback */}
        <Card className="border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
              Total Masukan
            </CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 font-heading">
              {totalCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Seluruh kritik & saran terdaftar
            </p>
          </CardContent>
        </Card>

        {/* Saran */}
        <Card className="border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
              Saran Fitur / Ide
            </CardTitle>
            <div className="p-2 bg-cyan-50 rounded-lg text-[#0891b2]">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0891b2] font-heading">
              {saranCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Ide pengembangan dari pengguna
            </p>
          </CardContent>
        </Card>

        {/* Kritik */}
        <Card className="border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
              Kritik & Keluhan
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600 font-heading">
              {kritikCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Keluhan teknis atau materi pembelajaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
        {/* Controls Header */}
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === "all"
                    ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedType("saran")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedType === "saran"
                    ? "bg-white text-[#0891b2] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-slate-500 hover:text-[#0891b2]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Saran
              </button>
              <button
                onClick={() => setSelectedType("kritik")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedType === "kritik"
                    ? "bg-white text-amber-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-slate-500 hover:text-amber-600"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Kritik
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari pengirim atau konten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[30%] font-semibold text-slate-500 text-xs font-heading">Pengguna</TableHead>
                  <TableHead className="w-[12%] font-semibold text-slate-500 text-xs font-heading">Tipe</TableHead>
                  <TableHead className="w-[43%] font-semibold text-slate-500 text-xs font-heading">Pesan</TableHead>
                  {/* <TableHead className="w-[15%] font-semibold text-slate-500 text-xs font-heading">Tanggal</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold text-slate-500 text-xs font-heading">Aksi</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((item) => {
                    const name = item.profiles?.full_name || "Tanpa Nama";
                    const email = item.profiles?.email || "No email";
                    const initials = getInitials(item.profiles);

                    return (
                      <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-1 ring-slate-100">
                              {item.profiles?.avatar_url && (
                                <AvatarImage src={item.profiles.avatar_url} alt={name} />
                              )}
                              <AvatarFallback className="font-bold text-xs bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-700 truncate leading-snug">
                                {name}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate font-medium">
                                {email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.type === "saran" ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-cyan-50 text-[#0891b2] px-2 py-0.5 rounded-full border border-cyan-100/50">
                              <Sparkles className="h-2.5 w-2.5" />
                              Saran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100/50">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Kritik
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-xs text-slate-600 font-medium truncate">
                            {item.content}
                          </p>
                        </TableCell>
                        {/* <TableCell className="text-xs text-slate-500 font-medium">
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => setSelectedFeedback(item)}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-[#1164b8] hover:bg-slate-100 transition-all cursor-pointer"
                            title="Baca Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell> */}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-xs font-medium">
                      Tidak ada kritik & saran yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        {selectedFeedback && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedFeedback.type === "saran" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-cyan-50 text-[#0891b2] px-2 py-0.5 rounded-full border border-cyan-100/50">
                    <Sparkles className="h-3 w-3" />
                    Saran Fitur
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100/50">
                    <AlertTriangle className="h-3 w-3" />
                    Kritik / Keluhan
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedFeedback.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 font-heading">
                Detail Masukan Pengguna
              </DialogTitle>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {/* Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  {selectedFeedback.profiles?.avatar_url && (
                    <AvatarImage src={selectedFeedback.profiles.avatar_url} alt={selectedFeedback.profiles.full_name || ""} />
                  )}
                  <AvatarFallback className="font-bold text-xs bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600">
                    {getInitials(selectedFeedback.profiles)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#1164b8]" />
                    {selectedFeedback.profiles?.full_name || "Tanpa Nama"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedFeedback.profiles?.email || "No email"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Isi Kritik / Saran</h4>
                <div className="p-4 bg-white rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words">
                    {selectedFeedback.content}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 w-full sm:w-auto text-xs font-semibold h-9 px-4 cursor-pointer">
                Tutup
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
