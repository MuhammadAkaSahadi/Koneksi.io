"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Trash2,
  Check,
  Inbox,
  AlertCircle,
  Activity,
  Calendar,
  X,
  CreditCard,
  DollarSign,
  Eye,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TransferProofModal } from "@/components/dashboard/TransferProofModal";
import { approveTransaction, rejectTransaction } from "@/app/(dashboard)/admin/transactions/actions";

interface Transaction {
  id: string;
  transaction_id_midtrans: string;
  user_id: string;
  item_name: string;
  subtotal: number;
  voucher_amount: number;
  total_amount: number;
  status: string;
  payment_type: string | null;
  transfer_proof_url: string | null;
  unique_code: number | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
}

interface TransactionsTableProps {
  initialTransactions: Transaction[];
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [flashingRows, setFlashingRows] = useState<Record<string, "insert" | "update">>({});
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Side Drawer detail panel state
  const [activeTrxDetail, setActiveTrxDetail] = useState<Transaction | null>(null);

  // Transfer proof modal state
  const [viewingProof, setViewingProof] = useState<Transaction | null>(null);

  const itemsPerPage = 10;
  const supabase = useMemo(() => createClient(), []);

  // 1. Supabase Realtime Listener
  useEffect(() => {
    const channel = supabase
      .channel("admin-transactions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newTrx = payload.new as any;
            
            // Ambil profile info user baru secara real-time
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url, email, is_admin")
              .eq("id", newTrx.user_id)
              .single();

            const fullTrx: Transaction = {
              id: newTrx.id,
              transaction_id_midtrans: newTrx.transaction_id_midtrans,
              user_id: newTrx.user_id,
              item_name: newTrx.item_name,
              subtotal: Number(newTrx.subtotal),
              voucher_amount: Number(newTrx.voucher_amount),
              total_amount: Number(newTrx.total_amount),
              status: newTrx.status,
              payment_type: newTrx.payment_type,
              transfer_proof_url: newTrx.transfer_proof_url || null,
              unique_code: newTrx.unique_code || null,
              created_at: newTrx.created_at,
              profiles: profile || null
            };

            setTransactions((prev) => [fullTrx, ...prev]);
            
            // Trigger Flash Hijau
            setFlashingRows((prev) => ({ ...prev, [fullTrx.id]: "insert" }));
            toast.success("Transaksi Baru Terdeteksi", {
              description: `${profile?.full_name || "Pengguna"} membeli ${newTrx.item_name}.`
            });

            setTimeout(() => {
              setFlashingRows((prev) => {
                const next = { ...prev };
                delete next[fullTrx.id];
                return next;
              });
            }, 3000);

          } else if (payload.eventType === "UPDATE") {
            const updatedTrx = payload.new as any;
            
            setTransactions((prev) => 
              prev.map((item) => {
                if (item.id === updatedTrx.id) {
                  return {
                    ...item,
                    status: updatedTrx.status,
                    payment_type: updatedTrx.payment_type,
                    transfer_proof_url: updatedTrx.transfer_proof_url || null,
                    total_amount: Number(updatedTrx.total_amount)
                  };
                }
                return item;
              })
            );

            // Trigger Flash Amber
            setFlashingRows((prev) => ({ ...prev, [updatedTrx.id]: "update" }));
            toast.info("Status Transaksi Diperbarui", {
              description: `Transaksi ${updatedTrx.transaction_id_midtrans} menjadi ${updatedTrx.status}.`
            });

            setTimeout(() => {
              setFlashingRows((prev) => {
                const next = { ...prev };
                delete next[updatedTrx.id];
                return next;
              });
            }, 3000);

          } else if (payload.eventType === "DELETE") {
            const deletedTrx = payload.old as any;
            setTransactions((prev) => prev.filter((item) => item.id !== deletedTrx.id));
            setSelectedIds((prev) => prev.filter((id) => id !== deletedTrx.id));
            setActiveTrxDetail((prev) => prev?.id === deletedTrx.id ? null : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Compute stats
  const stats = useMemo(() => {
    let successRevenue = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach((trx) => {
      const statusLower = trx.status.toLowerCase();
      const trxDate = new Date(trx.created_at);

      if (statusLower === "success" || statusLower === "sukses") {
        successCount += 1;
        // Total Pendapatan Bulan Ini
        if (trxDate.getMonth() === currentMonth && trxDate.getFullYear() === currentYear) {
          successRevenue += Number(trx.total_amount);
        }
      } else if (statusLower === "pending" || statusLower === "menunggu verifikasi") {
        pendingCount += 1;
      } else if (statusLower === "failed" || statusLower === "gagal" || statusLower === "cancelled" || statusLower === "expired") {
        failedCount += 1;
      }
    });

    return {
      successRevenue,
      successCount,
      pendingCount,
      failedCount
    };
  }, [transactions]);

  // 2. Filter & Cari Transaksi
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // Search
      const matchSearch = 
        trx.transaction_id_midtrans.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trx.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trx.profiles?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchStatus = true;
      if (statusFilter !== "all") {
        const trxStatus = trx.status.toLowerCase();
        if (statusFilter === "success") {
          matchStatus = trxStatus === "success" || trxStatus === "sukses";
        } else if (statusFilter === "pending") {
          matchStatus = trxStatus === "pending";
        } else if (statusFilter === "verifikasi") {
          matchStatus = trxStatus === "menunggu verifikasi";
        } else if (statusFilter === "failed") {
          matchStatus = trxStatus === "failed" || trxStatus === "gagal" || trxStatus === "cancelled" || trxStatus === "expired";
        }
      }

      // Date filter
      let matchDate = true;
      if (dateFilter !== "all") {
        const trxDate = new Date(trx.created_at);
        const now = new Date();
        if (dateFilter === "today") {
          matchDate = trxDate.toDateString() === now.toDateString();
        } else if (dateFilter === "7days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchDate = trxDate >= sevenDaysAgo;
        } else if (dateFilter === "month") {
          matchDate = trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "year") {
          matchDate = trxDate.getFullYear() === now.getFullYear();
        }
      }
      
      return matchSearch && matchStatus && matchDate;
    });
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // 4. Clipboard Copy
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID Transaksi Disalin", {
      description: `${id} berhasil disalin ke papan klip.`
    });
  };

  // 5. Checkbox Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = paginatedTransactions.map((t) => t.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = paginatedTransactions.map((t) => t.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedTransactions.length === 0) return false;
    return paginatedTransactions.every((t) => selectedIds.includes(t.id));
  }, [paginatedTransactions, selectedIds]);

  // Manual payment verification (approve/reject)
  const handleVerifyPayment = async (trx: Transaction) => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "success" })
        .eq("id", trx.id);

      if (updateError) throw updateError;

      // Cek item_name untuk menentukan apakah modul atau langganan
      const itemLower = trx.item_name.toLowerCase();
      if (itemLower.includes("langganan") || itemLower.includes("subscription")) {
        const isAnnual = itemLower.includes("tahunan") || itemLower.includes("annual") || itemLower.includes("12 bulan");
        const months = isAnnual ? 12 : 3;
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const { error: subError } = await supabase
          .from("subscriptions")
          .insert([{
            user_id: trx.user_id,
            plan_type: isAnnual ? "annual" : "3_month",
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            status: "active"
          }]);

        if (subError) throw subError;
      } else {
        // Modul lifetime enrollment
        const { data: theme } = await supabase
          .from("themes")
          .select("id")
          .eq("title", trx.item_name)
          .maybeSingle();

        if (theme) {
          const { error: enrollError } = await supabase
            .from("enrollments")
            .upsert({
              user_id: trx.user_id,
              theme_id: theme.id
            }, { onConflict: "user_id,theme_id" });

          if (enrollError) throw enrollError;
        }
      }

      toast.success("Transaksi Berhasil Diverifikasi!", {
        description: `Akses belajar telah aktif untuk siswa ${trx.profiles?.full_name || trx.profiles?.email}.`
      });

      // Update local state
      setTransactions((prev) => 
        prev.map((t) => t.id === trx.id ? { ...t, status: "success" } : t)
      );

      setActiveTrxDetail((prev) => prev && prev.id === trx.id ? { ...prev, status: "success" } : prev);
    } catch (err: any) {
      toast.error(`Gagal verifikasi pembayaran: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPayment = async (trx: Transaction) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", trx.id);

      if (error) throw error;

      toast.success("Transaksi Telah Ditolak", {
        description: `Invoice ${trx.transaction_id_midtrans} diubah menjadi Failed.`
      });

      setTransactions((prev) => 
        prev.map((t) => t.id === trx.id ? { ...t, status: "failed" } : t)
      );

      setActiveTrxDetail((prev) => prev && prev.id === trx.id ? { ...prev, status: "failed" } : prev);
    } catch (err: any) {
      toast.error(`Gagal menolak pembayaran: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Individual approve/reject for QRIS transactions
  const handleIndividualApprove = async (transactionId: string) => {
    try {
      await approveTransaction(transactionId);
      toast.success("Transaksi berhasil diapprove");
    } catch (error: any) {
      toast.error(error.message || "Gagal approve transaksi");
    }
  };

  const handleIndividualReject = async (transactionId: string) => {
    try {
      await rejectTransaction(transactionId);
      toast.success("Transaksi berhasil ditolak");
    } catch (error: any) {
      toast.error(error.message || "Gagal reject transaksi");
    }
  };

  // 6. Bulk Action Handlers
  const handleBulkStatusChange = async (newStatus: "success" | "pending" | "failed") => {
    setIsBulkUpdating(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .in("id", selectedIds);

      if (error) throw error;

      toast.success("Pembaruan Massal Berhasil", {
        description: `Berhasil mengubah status ${selectedIds.length} transaksi menjadi ${newStatus}.`
      });
      
      // Update local state immediately
      setTransactions((prev) => 
        prev.map((item) => {
          if (selectedIds.includes(item.id)) {
            return { ...item, status: newStatus };
          }
          return item;
        })
      );
      
      setSelectedIds([]);
    } catch (err: any) {
      toast.error("Gagal memperbarui transaksi", {
        description: err.message || "Terdapat error pada server."
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi ini secara permanen?`)) {
      return;
    }
    setIsBulkUpdating(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast.success("Penghapusan Massal Berhasil", {
        description: `Berhasil menghapus ${selectedIds.length} rekaman transaksi.`
      });
      
      setTransactions((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (err: any) {
      toast.error("Gagal menghapus transaksi", {
        description: err.message || "Terdapat error pada server."
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // 7. CSV Export
  const handleExportCSV = () => {
    const headers = ["ID Transaksi", "Nama Pengguna", "Email", "Modul/Paket", "Subtotal", "Potongan Voucher", "Total Pembayaran", "Status", "Metode Pembayaran", "Tanggal"];
    const rows = filteredTransactions.map((t) => [
      t.transaction_id_midtrans,
      t.profiles?.full_name || "N/A",
      t.profiles?.email || "N/A",
      t.item_name,
      t.subtotal,
      t.voucher_amount,
      t.total_amount,
      t.status,
      t.payment_type || "N/A",
      new Date(t.created_at).toLocaleString("id-ID")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Koneksiio_Transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Ekspor CSV Berhasil", {
      description: `Berhasil mengunduh ${filteredTransactions.length} baris transaksi.`
    });
  };

  const getStatusBadge = (status: string) => {
    const st = status.toLowerCase();
    if (st === "success" || st === "sukses") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] px-2.5 py-0.5 rounded-full border border-emerald-255">
          <CheckCircle className="h-3 w-3 text-[#10B981]" />
          Sukses
        </span>
      );
    } else if (st === "pending") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-amber-255">
          <Clock className="h-3 w-3 text-[#F59E0B]" />
          Pending
        </span>
      );
    } else if (st === "menunggu verifikasi") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
          <Activity className="h-3 w-3 text-blue-500" />
          Verifikasi
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] px-2.5 py-0.5 rounded-full border border-red-255">
          <XCircle className="h-3 w-3 text-[#EF4444]" />
          Gagal
        </span>
      );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const showingStart = filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, filteredTransactions.length);

  return (
    <div className="space-y-6">
      
      {/* SUMMARY STATS WIDGETS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        {/* Total Pendapatan Bulan Ini */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendapatan Bulan Ini</span>
            <h3 className="text-xl font-extrabold text-slate-800 font-heading tracking-tight">{formatCurrency(stats.successRevenue)}</h3>
          </div>
          <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Transaksi Sukses */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaksi Sukses</span>
            <h3 className="text-xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.successCount}</h3>
          </div>
          <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Transaksi Pending */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Pembayaran</span>
            <h3 className="text-xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.pendingCount}</h3>
          </div>
          <div className="h-11 w-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
            <Clock className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Transaksi Gagal */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gagal / Expired</span>
            <h3 className="text-xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.failedCount}</h3>
          </div>
          <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
            <XCircle className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* FILTER BAR & TABS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 space-y-4">
        
        {/* Top Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Tabs Segment */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-4 py-2 text-xs font-bold font-heading rounded-lg transition-all cursor-pointer",
                statusFilter === "all" ? "bg-white text-slate-855 shadow-sm" : "text-slate-500 hover:text-slate-855"
              )}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter("verifikasi")}
              className={cn(
                "px-4 py-2 text-xs font-bold font-heading rounded-lg transition-all cursor-pointer",
                statusFilter === "verifikasi" ? "bg-white text-slate-855 shadow-sm" : "text-slate-500 hover:text-slate-855"
              )}
            >
              Menunggu Verifikasi
            </button>
            <button
              onClick={() => setStatusFilter("success")}
              className={cn(
                "px-4 py-2 text-xs font-bold font-heading rounded-lg transition-all cursor-pointer",
                statusFilter === "success" ? "bg-white text-slate-855 shadow-sm" : "text-slate-500 hover:text-slate-855"
              )}
            >
              Sukses
            </button>
            <button
              onClick={() => setStatusFilter("failed")}
              className={cn(
                "px-4 py-2 text-xs font-bold font-heading rounded-lg transition-all cursor-pointer",
                statusFilter === "failed" ? "bg-white text-slate-855 shadow-sm" : "text-slate-500 hover:text-slate-855"
              )}
            >
              Gagal
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-150 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Real-Time
            </div>

            {/* Date filter dropdown */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-250 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#1164b8] focus:ring-1 focus:ring-[#1164b8] appearance-none pr-8 min-w-[130px]"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 flex items-center gap-1.5 text-xs font-bold font-heading rounded-lg transition-all bg-white cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              Download Laporan
            </button>
          </div>

        </div>

        {/* Search input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Cari ID Invoice, nama pembeli, email, atau item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] text-slate-800 focus:border-[#1164b8]"
          />
        </div>

      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-800">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                <th className="w-[4%] text-center pl-6 py-4">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-[#1164b8] focus:ring-[#1164b8] h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-slate-500 text-xs font-heading">ID Transaksi</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-xs font-heading">Tanggal</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-xs font-heading">Pembeli & Item</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-xs font-heading">Metode Bayar</th>
                <th className="py-4 px-4 text-center font-bold text-slate-500 text-xs font-heading">Kode Unik</th>
                <th className="py-4 px-4 text-center font-bold text-slate-500 text-xs font-heading">Bukti Transfer</th>
                <th className="py-4 px-4 text-right font-bold text-slate-500 text-xs font-heading">Total Tagihan</th>
                <th className="py-4 px-4 text-center font-bold text-slate-500 text-xs font-heading">Status</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-850">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((trx) => {
                  const buyerName = trx.profiles?.full_name || "Pengguna";
                  const buyerEmail = trx.profiles?.email || "No email";
                  const initials = buyerName.substring(0, 2).toUpperCase();
                  const isSelected = selectedIds.includes(trx.id);

                  return (
                    <tr
                      key={trx.id}
                      className={cn(
                        "border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer",
                        isSelected && "bg-indigo-50/20",
                        trx.payment_type === 'qris_static' && "bg-emerald-50/30",
                        flashingRows[trx.id] === "insert" && "bg-emerald-50 border-l-[3px] border-emerald-500 animate-pulse",
                        flashingRows[trx.id] === "update" && "bg-amber-50 border-l-[3px] border-amber-500 animate-pulse"
                      )}
                      onClick={() => setActiveTrxDetail(trx)}
                    >
                      {/* Checkbox */}
                      <td className="text-center pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(trx.id, e.target.checked)}
                          className="rounded border-slate-300 text-[#1164b8] focus:ring-[#1164b8] h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* ID Transaksi */}
                      <td className="py-4 px-4 font-mono text-xs font-bold text-[#1164b8]">
                        <span className="hover:underline" onClick={(e) => { e.stopPropagation(); handleCopyId(trx.transaction_id_midtrans); }}>
                          {trx.transaction_id_midtrans}
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                        {new Date(trx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Pembeli & Modul */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {trx.profiles?.avatar_url ? (
                            <img src={trx.profiles.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 truncate leading-snug">{buyerName}</span>
                            <span className="text-xs text-slate-400 font-medium truncate">{trx.item_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {trx.payment_type || "Midtrans API"}
                      </td>

                      {/* Kode Unik */}
                      <td className="py-4 px-4 text-center">
                        {trx.unique_code ? (
                          <span className="font-mono font-bold text-primary text-sm">
                            {trx.unique_code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Bukti Transfer */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {trx.transfer_proof_url ? (
                          <button
                            onClick={() => setViewingProof(trx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-lg transition-all cursor-pointer border border-blue-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 text-right font-extrabold text-slate-900 font-heading">
                        {formatCurrency(Number(trx.total_amount))}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(trx.status)}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {trx.status === 'pending' && trx.payment_type === 'qris_static' && (
                            <button
                              onClick={() => handleIndividualApprove(trx.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => setActiveTrxDetail(trx)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer border border-slate-200 shadow-sm"
                          >
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-24 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox className="h-14 w-14 text-slate-300 stroke-[1.2] mb-3" />
                      <p className="font-bold text-slate-650 font-heading">Tidak Ada Transaksi</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                        Tidak ada transaksi yang sesuai dengan filter atau pencarian Anda.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold text-slate-500">
            <div>
              Menampilkan <span className="font-bold text-slate-805">{showingStart}</span> - <span className="font-bold text-slate-805">{showingEnd}</span> dari <span className="font-bold text-slate-805">{filteredTransactions.length}</span> transaksi
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                    currentPage === page
                      ? "bg-[#1164b8] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED SIDE DRAWER PANEL */}
      {activeTrxDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setActiveTrxDetail(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition-all duration-300 animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <CreditCard className="h-5 w-5 text-[#1164b8]" />
                  <h3 className="font-extrabold text-base font-heading">Rincian Transaksi</h3>
                </div>
                <button
                  onClick={() => setActiveTrxDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                
                {/* Invoice Status Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID Invoice</span>
                    <h4 className="font-mono text-sm font-bold text-slate-800 flex items-center gap-1.5 group select-all">
                      {activeTrxDetail.transaction_id_midtrans}
                      <Copy 
                        className="h-3.5 w-3.5 text-slate-400 hover:text-[#1164b8] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={() => handleCopyId(activeTrxDetail.transaction_id_midtrans)}
                      />
                    </h4>
                  </div>
                  <div>
                    {getStatusBadge(activeTrxDetail.status)}
                  </div>
                </div>

                {/* Purchaser Details */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Detail Pelanggan</span>
                  <div className="flex items-center gap-3 p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                    {activeTrxDetail.profiles?.avatar_url ? (
                      <img src={activeTrxDetail.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center font-bold text-slate-500 shrink-0">
                        {(activeTrxDetail.profiles?.full_name || "US").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-sm">{activeTrxDetail.profiles?.full_name || "Sobat IoT"}</span>
                      <span className="text-xs text-slate-400 font-medium">{activeTrxDetail.profiles?.email || "No email"}</span>
                    </div>
                  </div>
                </div>

                {/* Rincian item & Biaya */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Detail Biaya & Item</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs font-semibold">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex justify-between">
                      <span className="text-slate-700">{activeTrxDetail.item_name}</span>
                      <span className="text-slate-900 font-extrabold">{formatCurrency(Number(activeTrxDetail.subtotal))}</span>
                    </div>
                    
                    {activeTrxDetail.voucher_amount > 0 && (
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between text-rose-650">
                        <span>Diskon / Voucher</span>
                        <span>-{formatCurrency(Number(activeTrxDetail.voucher_amount))}</span>
                      </div>
                    )}

                    <div className="px-4 py-3 bg-[#EBF5FF] flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-bold">Total Pembayaran</span>
                      <span className="text-[#1164b8] font-extrabold font-heading text-base">{formatCurrency(Number(activeTrxDetail.total_amount))}</span>
                    </div>
                  </div>
                </div>

                {/* Rincian Transaksi */}
                <div className="space-y-2 text-xs font-semibold text-slate-650">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Waktu Transaksi</span>
                    <span className="text-slate-800">{new Date(activeTrxDetail.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" })}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Metode Pembayaran</span>
                    <span className="text-slate-800">{activeTrxDetail.payment_type || "Midtrans Snap API"}</span>
                  </div>
                </div>

                {/* Bukti Transfer Manual */}
                {activeTrxDetail.transfer_proof_url ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Bukti Transfer Manual</span>
                    <div className="relative aspect-[3/4] w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img 
                        src={activeTrxDetail.transfer_proof_url} 
                        alt="Bukti Transfer" 
                        className="w-full h-full object-contain cursor-zoom-in hover:scale-[1.01] transition-transform" 
                        onClick={() => window.open(activeTrxDetail.transfer_proof_url || "", "_blank")}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-medium">Klik gambar untuk membuka di tab baru</p>
                  </div>
                ) : activeTrxDetail.payment_type === "transfer_manual" ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 space-y-1">
                    <AlertCircle className="h-6 w-6 mx-auto text-amber-500" />
                    <p className="font-bold text-xs text-slate-650">Bukti Transfer Belum Diunggah</p>
                    <p className="text-[10px] text-slate-400 leading-normal">Siswa memilih pembayaran transfer manual tetapi belum mengirimkan bukti.</p>
                  </div>
                ) : null}

              </div>

              {/* Drawer Actions */}
              {((activeTrxDetail.status.toLowerCase() === "menunggu verifikasi" || activeTrxDetail.status.toLowerCase() === "pending") && activeTrxDetail.payment_type === "transfer_manual") ? (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                  <button
                    disabled={isLoading}
                    onClick={() => handleRejectPayment(activeTrxDetail)}
                    className="flex-1 px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Tolak Pembayaran
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleVerifyPayment(activeTrxDetail)}
                    className="flex-1 px-4 py-2.5 bg-[#1164b8] hover:bg-[#1164b8]/95 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Verifikasi Pembayaran
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => setActiveTrxDetail(null)}
                    className="w-full px-4 py-2.5 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BAR FOR SELECTED */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E293B] text-white py-3.5 px-6 rounded-2xl shadow-2xl flex items-center justify-between gap-6 border border-slate-800 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1164b8] text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-350">
              Transaksi Terpilih
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("success")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-3 w-3" /> Set Sukses
            </button>
            <button
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("pending")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Clock className="h-3 w-3 animate-pulse" /> Set Pending
            </button>
            <button
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("failed")}
              className="bg-red-650 hover:bg-red-750 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="h-3 w-3" /> Batalkan
            </button>
            
            <div className="h-4 w-px bg-slate-700 mx-1" />
            
            <button
              disabled={isBulkUpdating}
              onClick={handleBulkDelete}
              className="bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-750 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Transfer Proof Modal */}
      <TransferProofModal
        transaction={viewingProof}
        isOpen={!!viewingProof}
        onClose={() => setViewingProof(null)}
        onApprove={handleIndividualApprove}
        onReject={handleIndividualReject}
      />

    </div>
  );
}
