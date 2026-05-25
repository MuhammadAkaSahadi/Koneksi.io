"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  LogOut,
  Settings,
  Users,
  Award,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  X
} from "lucide-react";
import { useTransition } from "react";
import { signout } from "@/app/(auth)/login/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLayout } from "./DashboardLayoutContent";

interface SidebarProps {
  isAdmin: boolean;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
  isMobileOpen: boolean;
  isCollapsed: boolean;
  isAdminRoute: boolean;
}

export function Sidebar({ 
  isAdmin, 
  profile, 
  isMobileOpen, 
  isCollapsed, 
  isAdminRoute 
}: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { setIsMobileOpen } = useLayout();

  const handleSignout = () => {
    startTransition(() => {
      signout();
    });
  };

  interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    isExternal?: boolean;
    badge?: string;
  }

  const adminLinks: SidebarLink[] = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Kelola Modul", href: "/admin/courses", icon: BookOpen },
    { name: "Manajemen Pengguna", href: "/admin/users", icon: Users },
    { name: "Data Transaksi", href: "/admin/transactions", icon: CreditCard },
    // { name: "Pengaturan Web", href: "/admin/settings", icon: Settings },
  ];

  const userLinks: SidebarLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Modul Saya", href: "/dashboard/courses", icon: BookOpen },
    { name: "Sertifikat", href: "/dashboard/certificates", icon: Award },
    { name: "Transaksi", href: "/dashboard/transactions", icon: CreditCard },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    { name: "Komunitas", href: "https://discord.gg/koneksiio", icon: MessageSquare, isExternal: true, badge: "Discord" },
  ];

  const links = isAdminRoute ? adminLinks : userLinks;

  const userInitials = profile?.full_name 
    ? profile.full_name.substring(0, 2).toUpperCase() 
    : profile?.email?.substring(0, 2).toUpperCase() || "AD";

  // Sidebar Render untuk Admin Rute
  const renderAdminSidebar = () => {
    return (
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1E293B] text-white transition-all duration-300 shadow-[2px_0_8px_rgba(0,0,0,0.1)] border-r border-white/5",
        isCollapsed ? "w-[72px]" : "w-[260px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className={cn(
          "flex items-center shrink-0 border-b border-white/10 px-6 transition-all duration-300",
          isCollapsed ? "h-16 justify-center px-0" : "h-[72px] justify-between"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-lg">
              K.
            </div>
            {!isCollapsed && (
              <span className="font-heading font-bold text-xl text-white tracking-tight flex items-center gap-1.5">
                Koneksi.io
                <span className="bg-[#b1de01] text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Admin
                </span>
              </span>
            )}
          </Link>
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-lg py-2.5 font-medium transition-all duration-150 group relative",
                    isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                    isActive
                      ? "bg-[#1164b8] text-white border-l-3 border-[#b1de01] font-semibold"
                      : "text-slate-300/70 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <link.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )} />
                  {!isCollapsed && <span className="text-[14px]">{link.name}</span>}
                  
                  {/* Tooltip on Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {link.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bagian Bawah Admin */}
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Profile Card */}
          <div className={cn(
            "flex items-center rounded-lg bg-white/5 transition-all duration-200",
            isCollapsed ? "justify-center p-2" : "p-3 justify-between"
          )}>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-white/10">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {userInitials}
                  </div>
                )}
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-white leading-tight">
                    {profile?.full_name || "Admin Utama"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Super Admin
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignout}
            disabled={isPending}
            className={cn(
              "flex items-center text-rose-400 rounded-lg py-2.5 font-medium transition-all bg-rose-500/15 hover:bg-rose-500/25 w-full group relative",
              isCollapsed ? "justify-center px-0" : "px-4 gap-3 text-sm"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
            
            {/* Tooltip on Collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-rose-950 text-xs rounded text-rose-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Keluar
              </div>
            )}
          </button>
        </div>
      </aside>
    );
  };

  // Sidebar Render untuk User Rute
  const renderUserSidebar = () => {
    return (
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0a0a0c] border-r border-[#1a1a1f] transition-all duration-300 shadow-xl",
        "w-[240px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-[#1a1a1f]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0891b2] text-white font-heading font-bold text-lg">
              K.
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-tight">Koneksi.io</span>
          </Link>
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
              
              if (link.isExternal) {
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-[14px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="h-5 w-5 text-slate-500 group-hover:text-white" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="bg-[#0891b2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </a>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium transition-all group",
                    isActive
                      ? "bg-[#0891b2] text-white shadow-md shadow-[#0891b2]/20 font-semibold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <link.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                  )} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bagian Bawah User */}
        <div className="mt-auto border-t border-[#1a1a1f] p-4 space-y-3">
          <Link
            href="/dashboard/help"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors border border-[#1a1a1f]"
          >
            <HelpCircle className="h-5 w-5 text-slate-500" />
            <span>Bantuan</span>
          </Link>
          <div className="h-px bg-[#1a1a1f] w-full" />
          <button
            onClick={handleSignout}
            disabled={isPending}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    );
  };

  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
      {isAdminRoute ? renderAdminSidebar() : renderUserSidebar()}
    </>
  );
}
