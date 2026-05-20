import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, PlayCircle, Lock, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const slug = (await params).slug;

  const { data: theme } = await supabase
    .from("themes")
    .select("*, chapters(*, lessons(*))")
    .eq("slug", slug)
    .single();

  if (!theme) {
    notFound();
  }

  // Sort chapters and lessons
  const chapters = theme.chapters?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  chapters.forEach((chapter: any) => {
    if (chapter.lessons) {
      chapter.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    }
  });

  const totalLessons = chapters.reduce((acc: number, chapter: any) => acc + (chapter.lessons?.length || 0), 0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
      {/* Hero Section */}
      <section className="w-full pt-12 pb-16 lg:pb-24 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 md:px-12">
          <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <Link href="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-slate-800 font-medium truncate max-w-[200px]">{theme.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                  Kategori Kursus
                </span>
                <span className="bg-accent/20 text-accent-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Freemium
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-slate-900 leading-tight">
                {theme.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                {theme.description || "Tingkatkan skill Anda melalui kurikulum berbasis project nyata dan pelajari teknologi secara mendalam dari awal hingga mahir."}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    K
                  </div>
                  <span>Oleh <span className="font-semibold text-slate-900">Koneksi.io</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Akses Selamanya</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{totalLessons} Sub-bab</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:relative">
              <Card className="sticky top-24 border-border shadow-xl rounded-xl overflow-hidden bg-white">
                <div className="aspect-video relative bg-slate-900 flex items-center justify-center group cursor-pointer">
                  {theme.thumbnail_url ? (
                    <img src={theme.thumbnail_url} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-accent-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                      Preview Tersedia
                    </span>
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">
                      {theme.price_lifetime > 0 
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(theme.price_lifetime)
                        : "Gratis"}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Akses Lifetime</p>
                  </div>
                  
                  <div className="space-y-3 mb-8 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span><strong>2 sub-bab GRATIS</strong> untuk dicoba</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>{totalLessons} sub-bab materi terstruktur</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>Pembaruan materi selamanya</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full font-bold bg-accent text-accent-foreground hover:bg-accent/90")}>
                      Mulai Belajar Gratis
                    </Link>
                    <Link href={`/checkout/${theme.slug}`} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full font-bold text-primary border-primary hover:bg-primary/5")}>
                      Beli Akses Penuh
                    </Link>
                  </div>
                  <p className="text-xs text-center text-slate-400 mt-4">Jaminan uang kembali 7 hari</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Syllabus */}
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-12">
          <div className="lg:w-2/3">
            <Tabs defaultValue="silabus" className="w-full">
              <div className="border-b bg-white sticky top-16 z-30 pt-2">
                <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                  <TabsTrigger 
                    value="silabus" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-base"
                  >
                    Silabus
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tentang" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-base"
                  >
                    Tentang
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="silabus" className="pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold font-heading">Kurikulum Modul</h3>
                  <span className="text-sm text-slate-500 font-medium">{chapters.length} Bab • {totalLessons} Materi</span>
                </div>
                
                <Accordion defaultValue={chapters.length > 0 ? [chapters[0].id] : []} className="w-full space-y-4">
                  {chapters.map((chapter: any) => (
                    <AccordionItem key={chapter.id} value={chapter.id} className="bg-white border rounded-xl overflow-hidden px-2 shadow-sm">
                      <AccordionTrigger className="hover:no-underline px-4 py-4">
                        <div className="flex flex-col items-start gap-1 text-left w-full pr-4">
                          <span className="font-bold text-base">{chapter.title}</span>
                          <span className="text-sm font-normal text-slate-500">
                            {chapter.lessons?.length || 0} materi
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="flex flex-col gap-2 pt-2">
                          {chapter.lessons?.map((lesson: any) => (
                            <Link 
                              key={lesson.id} 
                              href={lesson.is_free ? `/player/${theme.slug}/${lesson.id}` : `/checkout/${theme.slug}`}
                              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                            >
                              <div className="mt-0.5 shrink-0">
                                {lesson.is_free ? (
                                  <PlayCircle className="w-5 h-5 text-accent" />
                                ) : (
                                  <Lock className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="font-medium text-slate-800 group-hover:text-primary transition-colors">
                                  {lesson.title}
                                </span>
                                {lesson.is_free && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground px-2 py-0.5 rounded shrink-0 w-fit">
                                    Gratis
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="tentang" className="pt-8 prose prose-slate max-w-none">
                <h3 className="text-xl font-bold font-heading mb-4">Tentang Tema Ini</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {theme.description || "Modul komprehensif ini dirancang untuk membimbing Anda menguasai teknologi dari dasar. Anda akan belajar teori mendalam sekaligus mempraktekkannya melalui project-project terstruktur."}
                </p>
                <h4 className="text-lg font-bold mt-8 mb-4">Yang Akan Anda Pelajari</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Pemahaman konsep fundamental teknologi.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Praktek membangun aplikasi atau sistem dari nol.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Best practices industri dan penyelesaian masalah.</span>
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
