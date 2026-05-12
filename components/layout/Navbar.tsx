import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-12 flex h-16 md:h-18 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-heading font-bold text-lg md:text-xl">K.</span>
          </div>
          <span className="font-heading font-bold text-lg hidden md:inline-block">Koneksi.io</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/katalog" className="transition-colors hover:text-primary">
            Katalog
          </Link>
          <Link href="/tentang" className="transition-colors hover:text-primary text-muted-foreground">
            Tentang
          </Link>
          <Link href="/faq" className="transition-colors hover:text-primary text-muted-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline hidden md:block">
                Masuk
              </Link>
              <Link href="/login" className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:bg-accent/90")}>
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
