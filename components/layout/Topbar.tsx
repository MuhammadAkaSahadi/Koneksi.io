"use client";

import { UserNav } from "@/components/layout/UserNav";
import { User } from "@supabase/supabase-js";
import { Search, Bell, Menu, Home, ChevronRight, BookOpen, CreditCard, Users, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: User;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
  isAdmin: boolean;
  onMenuClick: () => void;
  isAdminRoute: boolean;
}

export function Topbar({ user, profile, isAdmin, onMenuClick, isAdminRoute }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate breadcrumb items
  const getBreadcrumbs = () => {
    if (!isAdminRoute) return null;
    
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { name: "Admin", href: "/admin", isLast: paths.length === 1 }
    ];

    if (paths.length > 1) {
      if (paths[1] === "courses") {
        breadcrumbs.push({ name: "Kelola Modul", href: "/admin/courses", isLast: true });
      } else if (paths[1] === "transactions") {
        breadcrumbs.push({ name: "Data Transaksi", href: "/admin/transactions", isLast: true });
      } else if (paths[1] === "users") {
        breadcrumbs.push({ name: "Manajemen Pengguna", href: "/admin/users", isLast: true });
      } else if (paths[1] === "settings") {
        breadcrumbs.push({ name: "Pengaturan Web", href: "/admin/settings", isLast: true });
      }
    }

    return breadcrumbs;
  };

  // Mock search data
  const searchItems = [
    { name: "Kelola Modul", category: "Menu", href: "/admin/courses", icon: BookOpen },
    { name: "IoT Fundamentals with ESP32", category: "Modul", href: "/admin/courses", icon: BookOpen },
    { name: "Data Transaksi", category: "Menu", href: "/admin/transactions", icon: CreditCard },
    { name: "Manajemen Pengguna", category: "Menu", href: "/admin/users", icon: Users },
    { name: "Pengaturan Web", category: "Menu", href: "/admin/settings", icon: Settings },
  ];

  const filteredSearchItems = searchQuery
    ? searchItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchItems;

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-[#FFFFFF] text-slate-800 px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Menu Hamburger untuk Mobile */}
      <button
        type="button"
        onClick={onMenuClick}
        className="text-slate-500 hover:text-slate-900 lg:hidden p-1 mr-2"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Bagian Kiri: Breadcrumb (Khusus Admin) */}
      <div className="flex items-center gap-2">
        {isAdminRoute && breadcrumbs ? (
          <nav className="hidden md:flex items-center space-x-2 text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            {breadcrumbs.map((bc, idx) => (
              <span key={bc.href} className="flex items-center">
                {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-400 mr-2" />}
                {bc.isLast ? (
                  <span className="text-slate-800 font-bold font-heading">{bc.name}</span>
                ) : (
                  <Link href={bc.href} className="hover:text-primary transition-colors">
                    {bc.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <span className="text-slate-800 font-bold font-heading text-lg md:text-xl hidden md:block">
            {!isAdminRoute && (pathname.startsWith("/dashboard/courses") ? "Modul Saya" : pathname.startsWith("/dashboard/transactions") ? "Riwayat Transaksi" : pathname.startsWith("/dashboard/profile") ? "Pengaturan Profil" : "Dashboard")}
          </span>
        )}
      </div>

      {/* Bagian Tengah: Search Bar */}
      <div className="flex flex-1 justify-end md:justify-center relative" ref={dropdownRef}>
        <div className="w-full max-w-[480px] relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <Input
            id="search-field"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className={cn(
              "block w-full rounded-full border py-2 pl-10 pr-4 text-sm transition-all outline-none",
              isAdminRoute 
                ? "border-slate-200 bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:border-[#1164b8] focus:bg-white focus:ring-2 focus:ring-[#1164b8]/10"
                : "border-slate-200 bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:border-[#0891b2] focus:bg-white focus:ring-2 focus:ring-[#0891b2]/10"
            )}
            placeholder={isAdminRoute ? "Cari transaksi, modul, pengguna..." : "Cari modul belajar..."}
            type="search"
            name="search"
            autoComplete="off"
          />

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-4 py-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Hasil Pencarian Cepat
              </div>
              <div className="mt-1 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {filteredSearchItems.length > 0 ? (
                  filteredSearchItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        router.push(item.href);
                        setShowSearchDropdown(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-slate-700 font-medium group-hover:text-slate-900">{item.name}</span>
                      </div>
                      <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-sm text-slate-400">
                    Tidak ada hasil pencarian.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bagian Kanan: Aksi & Profil */}
      <div className="flex items-center gap-x-4 lg:gap-x-6 shrink-0">
        {/* Notifikasi Bell dengan Animasi Red Dot Pulse */}
        <button 
          type="button" 
          className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all group"
        >
          <span className="sr-only">Lihat notifikasi</span>
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* Dropdown Profil (UserNav) */}
        <UserNav user={user} profile={profile} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
