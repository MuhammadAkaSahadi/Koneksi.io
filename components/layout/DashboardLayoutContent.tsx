"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TopAlertBanner } from "@/components/dashboard/TopAlertBanner";
import { User } from "@supabase/supabase-js";

interface LayoutContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

interface DashboardLayoutContentProps {
  children: React.ReactNode;
  user: User;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
  isAdmin: boolean;
}

export function DashboardLayoutContent({
  children,
  user,
  profile,
  isAdmin,
}: DashboardLayoutContentProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    const dismissed = localStorage.getItem("profile_alert_dismissed");
    if (dismissed === "true") {
      setIsAlertDismissed(true);
    }
  }, []);

  const handleCloseAlert = () => {
    localStorage.setItem("profile_alert_dismissed", "true");
    setIsAlertDismissed(true);
  };

  const showProfileWarning = !isAdminRoute && (!profile || !profile.full_name) && !isAlertDismissed;

  // Auto-collapse sidebar on tablet landscape, drawer on tablet portrait/mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Admin responsive limits
      if (isAdminRoute) {
        if (width < 768) {
          setShowWarning(true);
          setIsCollapsed(false);
        } else if (width >= 768 && width < 1024) {
          setShowWarning(false);
          setIsCollapsed(false); // off-canvas drawer
        } else if (width >= 1024 && width < 1280) {
          setShowWarning(false);
          setIsCollapsed(true); // icon-only
        } else {
          setShowWarning(false);
          setIsCollapsed(false); // full desktop
        }
      } else {
        // User responsive limits
        setShowWarning(false);
        if (width < 1024) {
          setIsCollapsed(false);
        } else {
          setIsCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isAdminRoute]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <LayoutContext.Provider value={{ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }}>
      <div className={cn(
        "flex min-h-screen transition-colors duration-300 bg-[#F8FAFC]"
      )}>
        {/* Responsive Mobile Alert for Admin */}
        {isAdminRoute && showWarning && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1E293B] text-white p-6 text-center">
            <div className="bg-red-500/20 text-red-400 p-4 rounded-full mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-heading mb-2">Layar Terlalu Kecil</h1>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Gunakan perangkat desktop atau tablet landscape untuk pengalaman pengelolaan admin Koneksi.io terbaik.
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Tetap Lanjutkan
            </button>
          </div>
        )}

        {/* Sidebar component rendering */}
        <Sidebar
          isAdmin={isAdmin}
          profile={profile}
          isMobileOpen={isMobileOpen}
          isCollapsed={isCollapsed}
          isAdminRoute={isAdminRoute}
        />

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-h-screen",
          isAdminRoute 
            ? isCollapsed 
              ? "pl-[72px]" 
              : "pl-0 lg:pl-[260px]"
            : "pl-0 lg:pl-[240px]"
        )}>
          {/* Topbar component rendering */}
          <Topbar
            user={user}
            profile={profile}
            isAdmin={isAdmin}
            onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
            isAdminRoute={isAdminRoute}
          />

          {showProfileWarning && (
            <TopAlertBanner onClose={handleCloseAlert} />
          )}

          <main className={cn(
            "flex-1 transition-all duration-300",
            isAdminRoute ? "p-6 md:p-8 lg:p-10" : "p-4 md:p-8"
          )}>
            <div className={cn("mx-auto w-full", isAdminRoute && "max-w-[1400px]")}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
