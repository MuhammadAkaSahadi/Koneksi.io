import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronRight, Clock, BookOpen, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Katalog Modul Kursus | Koneksi.io",
  description: "Eksplorasi katalog kursus IoT dan Software Engineering terlengkap.",
};

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const q = sp.q || "";
  
  let query = supabase.from("themes").select("*").order("created_at", { ascending: false });
  
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: themes } = await query;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
      {/* Header Section */}
      <section className="w-full pt-12 pb-24 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-12 relative z-10">
          <nav className="flex text-sm text-primary-foreground/80 mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-white font-medium">Katalog</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">Katalog Pembelajaran</h1>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full">
              Semua Modul
            </Button>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full">
              Software
            </Button>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full">
              Hardware (IoT)
            </Button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="w-full sticky top-16 z-40 bg-white border-b shadow-sm -mt-8">
        <div className="container mx-auto px-4 md:px-12 py-4">
          <form className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <Input
                type="search"
                name="q"
                defaultValue={q}
                className="pl-10 bg-slate-50 border-slate-200"
                placeholder="Cari tema atau teknologi..."
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0 border-primary text-primary bg-primary/5">
                Semua Level
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0">
                Gratis
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0">
                Lifetime
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0">
                Subscription
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full py-12">
        <div className="container mx-auto px-4 md:px-12">
          {themes && themes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {themes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden flex flex-col group hover:border-primary hover:shadow-[0_8px_24px_rgba(17,100,184,0.12)] transition-all duration-300">
                  <div className="aspect-[4/3] relative bg-slate-200 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <span className="text-white/50 font-heading font-medium">Koneksi.io</span>
                    </div>
                    {theme.thumbnail_url && (
                      <img src={theme.thumbnail_url} alt={theme.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        FREEMIUM
                      </span>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-6 flex flex-col pt-6">
                    <div className="mb-2">
                      <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">
                        Kategori
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-heading line-clamp-2 leading-tight mb-4 group-hover:text-primary transition-colors">
                      {theme.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Sub-bab materi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Akses selamanya</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm font-medium text-accent mb-4">
                      <Layers className="w-4 h-4" />
                      <span>2 sub-bab gratis</span>
                    </div>
                    
                    <div className="h-px w-full bg-slate-100 my-4"></div>
                    
                    <div className="mt-auto">
                      <div className="mb-4">
                        <p className="text-lg font-bold text-slate-900">
                          {theme.price_lifetime > 0 
                            ? `${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(theme.price_lifetime)} Lifetime`
                            : "Gratis"}
                        </p>
                      </div>
                      <Link href={`/katalog/${theme.slug}`} className={cn(buttonVariants({ variant: "outline" }), "w-full h-12 text-base group-hover:bg-primary")}>
                        Lihat Detail
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                <Search className="w-24 h-24 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2">Tidak menemukan tema yang cocok</h3>
              <p className="text-slate-500 mb-6">Coba gunakan kata kunci lain atau hapus filter pencarian.</p>
              <Link href="/katalog" className={buttonVariants({ variant: "outline" })}>
                Reset Pencarian
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
