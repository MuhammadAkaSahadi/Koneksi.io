"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Key, 
  ShieldAlert,
  ChevronLeft, 
  ChevronRight,
  Loader2,
  X,
  Mail,
  User,
  Users
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  status: string;
  banned_reason: string | null;
  created_at: string;
}

interface UsersTableProps {
  initialUsers: UserProfile[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Selection / Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal / Detail States
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
  const [banUser, setBanUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState("");
  
  // Loading
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Compute Header Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "Aktif").length;
    
    // Baru minggu ini (7 hari terakhir)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newThisWeek = users.filter(u => new Date(u.created_at) >= sevenDaysAgo).length;

    return { total, active, newThisWeek };
  }, [users]);

  // Filters & Search
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const nameMatch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const idMatch = user.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || emailMatch || idMatch;

      const roleStr = user.is_admin ? "admin" : "siswa";
      const matchesRole = roleFilter === "all" || roleStr === roleFilter;

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Toggle selection for a single row
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle selection for all rows on current page
  const toggleSelectAll = () => {
    const currentPageIds = paginatedUsers.map((u) => u.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Change Role action
  const handleToggleRole = async (user: UserProfile) => {
    setIsLoading(true);
    const newRoleValue = !user.is_admin;
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: newRoleValue })
      .eq("id", user.id);

    if (error) {
      toast.error(`Gagal mengubah role: ${error.message}`);
    } else {
      toast.success(`Role ${user.full_name || user.email} berhasil diubah menjadi ${newRoleValue ? "Admin" : "Siswa"}`);
      setUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, is_admin: newRoleValue } : u)
      );
    }
    setActiveKebabId(null);
    setIsLoading(false);
  };

  // Quick Status Toggle Switch (Aktif <-> Inaktif)
  const handleStatusToggle = async (user: UserProfile) => {
    setIsLoading(true);
    const newStatus = user.status === "Aktif" ? "Inaktif" : "Aktif";
    
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", user.id);

    if (error) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    } else {
      toast.success(`Status akun ${user.full_name || user.email} diubah menjadi ${newStatus}`);
      setUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u)
      );
    }
    setIsLoading(false);
  };

  // Reset Password Action
  const handleResetPassword = async (user: UserProfile) => {
    setActiveKebabId(null);
    toast.info("Memproses reset password...", { description: `Mengirim email instruksi ke ${user.email}...` });
    
    // Simulate/Trigger supabase password reset
    const { error } = await supabase.auth.resetPasswordForEmail(user.email || "", {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(`Gagal mengirim link reset password: ${error.message}`);
    } else {
      toast.success("Link reset password berhasil dikirim ke email!");
    }
  };

  // Suspend/Banned Submit Action
  const handleBanned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banUser) return;
    if (!banReason.trim()) {
      toast.error("Alasan pemblokiran wajib ditulis");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: "Banned",
        banned_reason: banReason 
      })
      .eq("id", banUser.id);

    if (error) {
      toast.error(`Gagal memblokir user: ${error.message}`);
    } else {
      toast.success(`User ${banUser.full_name || banUser.email} berhasil dibanned`);
      setUsers((prev) => 
        prev.map((u) => u.id === banUser.id ? { ...u, status: "Banned", banned_reason: banReason } : u)
      );
      setBanUser(null);
      setBanReason("");
    }
    setActiveKebabId(null);
    setIsLoading(false);
  };

  // Lift Suspend Action
  const handleLiftSuspend = async (user: UserProfile) => {
    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: "Aktif",
        banned_reason: null
      })
      .eq("id", user.id);

    if (error) {
      toast.error(`Gagal membuka pemblokiran: ${error.message}`);
    } else {
      toast.success(`Pemblokiran ${user.full_name || user.email} telah dicabut`);
      setUsers((prev) => 
        prev.map((u) => u.id === user.id ? { ...u, status: "Aktif", banned_reason: null } : u)
      );
    }
    setActiveKebabId(null);
    setIsLoading(false);
  };

  // Bulk Suspend Selected
  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ status: "Banned", banned_reason: "Aksi Massal Admin" })
      .in("id", selectedIds);

    if (error) {
      toast.error(`Gagal memblokir massal: ${error.message}`);
    } else {
      toast.success(`${selectedIds.length} pengguna berhasil dibanned massal`);
      setUsers((prev) => 
        prev.map((u) => selectedIds.includes(u.id) ? { ...u, status: "Banned", banned_reason: "Aksi Massal Admin" } : u)
      );
      setSelectedIds([]);
    }
    setIsLoading(false);
  };

  // Bulk Activate Selected
  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ status: "Aktif", banned_reason: null })
      .in("id", selectedIds);

    if (error) {
      toast.error(`Gagal mengaktifkan massal: ${error.message}`);
    } else {
      toast.success(`${selectedIds.length} pengguna berhasil diaktifkan massal`);
      setUsers((prev) => 
        prev.map((u) => selectedIds.includes(u.id) ? { ...u, status: "Aktif", banned_reason: null } : u)
      );
      setSelectedIds([]);
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Aktif</span>;
      case "Inaktif":
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Inaktif</span>;
      case "Banned":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Banned</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.total}</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-[#1164b8] rounded-xl flex items-center justify-center shadow-sm">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna Aktif</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.active}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baru Minggu Ini</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-heading tracking-tight">{stats.newThisWeek}</h3>
          </div>
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama, Email, atau ID Pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8] text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700 min-w-[130px]"
          >
            <option value="all">Semua Peran</option>
            <option value="siswa">Siswa</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700 min-w-[130px]"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Inaktif">Inaktif</option>
            <option value="Banned">Banned</option>
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative">
        
        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                <th className="py-4 px-6 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id))}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-[#1164b8] focus:ring-[#1164b8] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6">Pengguna</th>
                <th className="py-4 px-6">Peran (Role)</th>
                <th className="py-4 px-6">Bergabung</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Aktifkan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors",
                      selectedIds.includes(user.id) && "bg-slate-50/70"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#1164b8] focus:ring-[#1164b8] cursor-pointer"
                      />
                    </td>

                    {/* Profil */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200 bg-slate-100" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                            {(user.full_name || user.email || "US").substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{user.full_name || "Sobat IoT"}</span>
                          <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Peran */}
                    <td className="py-4 px-6">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md",
                        user.is_admin 
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200" 
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      )}>
                        {user.is_admin ? "Admin" : "Siswa"}
                      </span>
                    </td>

                    {/* Bergabung */}
                    <td className="py-4 px-6 font-medium text-slate-500">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-4 px-6 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={user.status === "Banned"}
                          checked={user.status === "Aktif"}
                          onChange={() => handleStatusToggle(user)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-[#1164b8] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1164b8] disabled:opacity-50 disabled:cursor-not-allowed"></div>
                      </label>
                    </td>

                    {/* Aksi Kebab Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setActiveKebabId(activeKebabId === user.id ? null : user.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeKebabId === user.id && (
                          <>
                            <div 
                              onClick={() => setActiveKebabId(null)}
                              className="fixed inset-0 z-30" 
                            />
                            <div className="absolute right-6 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1 animate-in slide-in-from-top-1 duration-150 text-left">
                              {/* Lihat profil */}
                              <button
                                onClick={() => { setDetailUser(user); setActiveKebabId(null); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <User className="h-4 w-4 text-slate-400" />
                                Lihat Detail
                              </button>

                              {/* Ubah role */}
                              <button
                                onClick={() => handleToggleRole(user)}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <UserCheck className="h-4 w-4 text-slate-400" />
                                Jadikan {user.is_admin ? "Siswa" : "Admin"}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(user)}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <Key className="h-4 w-4 text-slate-400" />
                                Reset Password
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              {/* Banned / Lift suspend */}
                              {user.status === "Banned" ? (
                                <button
                                  onClick={() => handleLiftSuspend(user)}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-emerald-600 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 text-emerald-500" />
                                  Buka Blokir (Aktif)
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setBanUser(user); setActiveKebabId(null); }}
                                  className="w-full px-4 py-2 hover:bg-red-50 text-red-650 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                  <UserX className="h-4 w-4 text-red-500" />
                                  Suspend / Banned
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                      <span className="font-bold text-slate-500 font-heading">Tidak Ada Pengguna</span>
                      <span className="text-xs max-w-xs text-slate-400">Pengguna tidak ditemukan dalam kriteria filter Anda.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="font-bold text-slate-800">{Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="font-bold text-slate-800">{Math.min(filteredUsers.length, currentPage * itemsPerPage)}</span> dari <span className="font-bold text-slate-800">{filteredUsers.length}</span> pengguna
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border border-slate-250 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-650 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border border-slate-250 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-650 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar (Float Panel) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-6 border border-slate-850 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-bold">
            <span className="text-[#b1de01]">{selectedIds.length}</span> pengguna terpilih
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkActivate}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Aktifkan Akun
            </button>
            <button
              onClick={handleBulkSuspend}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Banned Massal
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* BAN/SUSPEND DIALOG WITH REASON */}
      {banUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleBanned} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-red-650">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <h4 className="text-base font-extrabold text-slate-800 font-heading">Tangguhkan Akun Pengguna</h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Anda akan memblokir akses login **{banUser.full_name || banUser.email}** ke platform. Harap ketik alasan pemblokiran secara rinci di bawah ini:
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alasan Pemblokiran</label>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Terdeteksi melakukan spamming link judi atau melanggar hak cipta materi pembelajaran..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setBanUser(null); setBanReason(""); }}
                className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Suspend Akun
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden text-left flex flex-col">
            
            {/* Title banner */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {detailUser.avatar_url ? (
                  <img src={detailUser.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#1164b8]/10 text-[#1164b8] flex items-center justify-center font-bold text-lg border border-[#1164b8]/20">
                    {(detailUser.full_name || detailUser.email || "US").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-800 font-heading leading-tight">{detailUser.full_name || "Sobat IoT"}</h4>
                  <span className="text-xs text-slate-400 font-medium">{detailUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info Body */}
            <div className="p-6 space-y-4 text-xs font-semibold text-slate-650">
              
              {/* ID */}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">ID Pengguna</span>
                <span className="font-mono text-slate-800 select-all">{detailUser.id}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between border-b border-slate-100 pb-2 items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Status Akun</span>
                <span>{getStatusBadge(detailUser.status)}</span>
              </div>

              {/* Peran */}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Hak Akses</span>
                <span className="text-slate-800">{detailUser.is_admin ? "Super Administrator" : "Siswa Pembelajar"}</span>
              </div>

              {/* Tanggal Join */}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Mendaftar Pada</span>
                <span className="text-slate-800">{new Date(detailUser.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</span>
              </div>

              {/* Banned Reason info */}
              {detailUser.status === "Banned" && (
                <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-1">
                  <span className="text-red-700 font-bold uppercase tracking-wider text-[10px]">Alasan Penangguhan:</span>
                  <p className="text-slate-600 font-medium text-xs leading-normal">
                    {detailUser.banned_reason || "Tidak dicantumkan alasan pemblokiran."}
                  </p>
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-all"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
