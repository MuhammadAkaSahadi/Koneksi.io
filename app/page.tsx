import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Laptop, Cpu, BookOpen, GraduationCap, PlayCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch featured themes
  const { data: featuredThemes } = await supabase
    .from("themes")
    .select("*")
    .limit(3)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 border-b">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Platform Pembelajaran Teknologi Mandiri
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight tracking-tight text-slate-900">
                Bangun Kompetensi Tech dari <span className="text-primary">Nol hingga Siap Industri</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-[600px] leading-relaxed">
                Jembatan talenta digital Indonesia ke industri teknologi melalui jalur belajar IoT (Hardware) dan Software yang terstruktur berbasis proyek nyata.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-base bg-accent text-accent-foreground hover:bg-accent/90")}>
                  Mulai Belajar Gratis
                </Link>
                <Link href="/katalog" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-14 px-8 text-base border-primary text-primary hover:bg-primary/5")}>
                  Lihat Katalog
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>2 sub-bab gratis setiap tema</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Tanpa kartu kredit</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-square bg-primary/5 rounded-full flex items-center justify-center p-8 border border-primary/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
                <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10">
                  <div className="bg-white rounded-2xl shadow-xl flex items-center justify-center border p-6 flex-col gap-4 transform -translate-y-4">
                    <Laptop className="h-12 w-12 text-primary" />
                    <span className="font-semibold font-heading text-sm text-center">Software Engineering</span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl flex items-center justify-center border p-6 flex-col gap-4 transform translate-y-8">
                    <Cpu className="h-12 w-12 text-accent" />
                    <span className="font-semibold font-heading text-sm text-center text-slate-800">Internet of Things</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 md:px-12">
          <div className="text-center mb-16 max-w-[800px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Mengapa Belajar di Koneksi.io?</h2>
            <p className="text-lg text-slate-600">Pendekatan belajar yang dirancang khusus untuk memastikan Anda tidak hanya paham teori, tapi mampu membangun proyek nyata.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Self-Paced Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-600">
                  Belajar kapan saja dan di mana saja. Sesuaikan kecepatan belajar dengan kesibukan Anda tanpa ada tenggat waktu yang mengikat.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <PlayCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Model Freemium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-600">
                  Coba sebelum membeli! Nikmati 2 sub-bab gratis pada setiap tema untuk memastikan materi sesuai dengan ekspektasi Anda.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Berbasis Proyek Nyata</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-600">
                  Setiap tema dirancang untuk menghasilkan proyek portofolio yang dapat Anda pamerkan kepada rekruter atau klien.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section className="w-full py-24 bg-slate-50 border-t">
        <div className="container mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-[600px]">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Mulai Perjalanan Tech-mu</h2>
              <p className="text-lg text-slate-600">Pilih jalur Software atau Hardware (IoT) dengan kurikulum yang selalu relevan dengan kebutuhan industri.</p>
            </div>
            <Link href="/katalog" className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}>
              Lihat Semua Tema
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredThemes && featuredThemes.length > 0 ? (
              featuredThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden flex flex-col group hover:border-primary hover:shadow-lg transition-all hover:scale-[1.02]">
                  <div className="aspect-video relative bg-slate-200 overflow-hidden">
                    {/* Placeholder thumbnail if thumbnail_url is empty */}
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <span className="text-white/50 font-heading font-medium">Koneksi.io</span>
                    </div>
                    {theme.thumbnail_url && (
                      <img src={theme.thumbnail_url} alt={theme.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Freemium
                      </span>
                    </div>
                  </div>
                  <CardHeader className="flex-1 pb-4">
                    <CardTitle className="text-xl line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                      {theme.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {theme.description || "Pelajari teknologi terbaru dengan metode self-paced."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between py-4 border-t border-b mb-4 text-sm text-slate-600">
                      <span>Materi Terstruktur</span>
                      <span className="font-medium text-accent">2 sub-bab gratis</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Akses Lifetime</p>
                        <p className="text-lg font-bold">
                          {theme.price_lifetime > 0 
                            ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(theme.price_lifetime)
                            : "Gratis"}
                        </p>
                      </div>
                      <Link href={`/katalog/${theme.slug}`} className={cn(buttonVariants(), "w-auto px-6")}>
                        Detail
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex justify-center py-12">
                <p className="text-slate-500">Belum ada kursus tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 md:px-12 relative z-10 text-center max-w-[800px]">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Siap Memulai Pembelajaran?</h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10">
            Bergabung dengan ratusan talenta digital lainnya dan bangun karir teknologi impian Anda mulai hari ini.
          </p>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-16 px-10 text-lg bg-accent text-accent-foreground hover:bg-accent/90")}>
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
