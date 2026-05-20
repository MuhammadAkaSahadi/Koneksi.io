"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  LogOut,
  Settings
} from "lucide-react";
import { useTransition } from "react";
import { signout } from "@/app/(auth)/login/actions"; // wait, need to check if path to actions is correct

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignout = () => {
    startTransition(() => {
      signout();
    });
  };

  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Buat Course", href: "/admin/courses", icon: BookOpen },
    { name: "Transaksi Terbaru", href: "/admin/transactions", icon: CreditCard },
  ];

  const userLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Course", href: "/dashboard/courses", icon: BookOpen },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-heading font-bold text-lg">K.</span>
          </div>
          <span className="font-heading font-bold text-xl text-primary">Koneksi.io</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-200 p-4">
        <button
          onClick={handleSignout}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
