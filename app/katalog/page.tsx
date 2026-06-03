import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Clock, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Katalog Modul Kursus | Koneksi.io",
  description:
    "Eksplorasi katalog kursus IoT dan Software Engineering terlengkap.",
};

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const q = sp.q || "";

  let query = supabase
    .from("themes")
    .select("*, chapters(*, lessons(*))")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: themes } = await query;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24 text-slate-600">
      {/* Header Section */}
      <section className="w-full pt-12 pb-20 bg-white border-b border-slate-200 relative">
        <div className="container mx-auto px-4 md:px-12 relative z-10 space-y-4">
          <nav className="flex text-sm text-slate-500" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                  <span className="text-slate-650 font-medium">Katalog</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
            Katalog Pembelajaran
          </h1>
          <p className="text-slate-650 text-sm max-w-xl leading-relaxed">
            Pilih modul IoT & Tech terapan buatan pakar industri dan tingkatkan
            keahlian kamu hari ini.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="bg-primary hover:bg-primary/90 text-white border-0 rounded-full text-xs font-bold px-4 py-1.5 h-8">
              Semua Modul
            </Button>
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-full text-xs font-semibold px-4 py-1.5 h-8"
            >
              Software
            </Button>
            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-full text-xs font-semibold px-4 py-1.5 h-8"
            >
              Hardware (IoT)
            </Button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="w-full sticky top-0 z-40 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
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
                className="pl-10 bg-white border-slate-200 text-slate-800 placeholder-slate-450 focus:border-primary focus:ring-2 focus:ring-primary/20 h-10 rounded-xl"
                placeholder="Cari tema atau teknologi..."
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-primary text-primary bg-primary/5 hover:bg-primary/10 text-xs font-bold"
              >
                Semua Level
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-slate-200 text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
                Gratis
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-slate-200 text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
                Lifetime
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-slate-200 text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themes.map((theme) => {
                // Calculate total lessons
                const totalLessons =
                  theme.chapters?.reduce(
                    (acc: number, c: any) => acc + (c.lessons?.length || 0),
                    0,
                  ) || 0;
                const category =
                  theme.category ||
                  (theme.title.toLowerCase().includes("esp32")
                    ? "Hardware (IoT)"
                    : "IoT Cloud / Web");

                return (
                  <Card
                    key={theme.id}
                    className="overflow-hidden flex flex-col justify-between bg-white border-slate-200 text-slate-800 rounded-2xl shadow-sm hover:border-primary hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      {/* Thumbnail with overlay status badge */}
                      <div className="aspect-video relative bg-slate-100 overflow-hidden border-b border-slate-200">
                        {theme.thumbnail_url ? (
                          <img
                            src={theme.thumbnail_url}
                            alt={theme.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-accent text-accent-foreground text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-md">
                            FREEMIUM
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 space-y-4 text-left">
                        <div>
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                            {category}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug line-clamp-2 mt-1.5 group-hover:text-primary transition-colors min-h-[50px]">
                            {theme.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{totalLessons} Sub-bab materi</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Akses selamanya</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg w-fit">
                          <span>2 Bab Setup & Pendahuluan GRATIS</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Price & CTA */}
                    <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">
                          Akses Lifetime
                        </span>
                        <span className="text-base font-extrabold text-slate-900 font-heading">
                          {theme.price_lifetime > 0
                            ? new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                              }).format(theme.price_lifetime)
                            : "Gratis"}
                        </span>
                      </div>

                      <Link href={`/katalog/${theme.slug}`}>
                        <Button className="bg-slate-100 hover:bg-primary text-slate-700 hover:text-white border-0 rounded-xl px-4 text-xs font-bold cursor-pointer transition-all">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-36 h-36 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-1.5">
                Tidak menemukan tema yang cocok
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                Coba gunakan kata kunci lain atau hapus filter pencarian.
              </p>
              <Link
                href="/katalog"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6",
                )}
              >
                Reset Pencarian
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
