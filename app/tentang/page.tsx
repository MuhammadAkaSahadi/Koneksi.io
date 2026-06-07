import Link from "next/link";
import { ChevronRight, Target, Users, Zap, Globe, BookOpen, Award } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Tentang Kami | Koneksi.io",
  description: "Kenali lebih dekat Koneksi.io — platform kursus IoT dan Software Engineering untuk talenta digital Indonesia.",
};

const values = [
  {
    icon: Target,
    title: "Terstruktur & Terarah",
    description:
      "Setiap jalur belajar dirancang oleh praktisi industri agar relevan dengan kebutuhan dunia kerja nyata.",
  },
  {
    icon: Globe,
    title: "Konteks Lokal Indonesia",
    description:
      "Materi, bahasa, dan contoh kasus disesuaikan dengan ekosistem teknologi dan industri Indonesia.",
  },
  {
    icon: Zap,
    title: "Praktis & Langsung Diterapkan",
    description:
      "Bukan hanya teori — setiap modul dilengkapi project nyata yang bisa langsung masuk ke portofolio kamu.",
  },
  {
    icon: Users,
    title: "Komunitas yang Supportif",
    description:
      "Belajar tidak harus sendirian. Bergabunglah dengan ribuan pelajar dan mentor aktif di komunitas Discord kami.",
  },
];

const stats = [
  { label: "Pelajar Aktif", value: "5.000+" },
  { label: "Modul Kursus", value: "20+" },
  { label: "Mentor Berpengalaman", value: "10+" },
  { label: "Kota di Indonesia", value: "34+" },
];

const team = [
  {
    name: "Ahmad Rizki",
    role: "Co-founder & CEO",
    bio: "10+ tahun pengalaman di industri IoT dan embedded systems. Ex-engineer di perusahaan manufaktur otomotif.",
  },
  {
    name: "Dewi Sartika",
    role: "Co-founder & CTO",
    bio: "Full-stack developer dengan spesialisasi di cloud infrastructure dan real-time systems.",
  },
  {
    name: "Budi Santoso",
    role: "Head of Curriculum",
    bio: "Dosen dan praktisi yang telah mengajarkan teknologi kepada ribuan mahasiswa di seluruh Indonesia.",
  },
];

export default function TentangPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <section className="w-full pt-12 pb-32 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 md:px-12 relative z-10">
          <nav className="flex text-sm text-primary-foreground/80 mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-white font-medium">Tentang</span>
                </div>
              </li>
            </ol>
          </nav>
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            Tentang Koneksi.io
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 max-w-2xl leading-tight">
            Jembatan Talenta Digital Indonesia ke Industri Teknologi
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl leading-relaxed">
            Koneksi.io lahir dari keyakinan bahwa setiap anak bangsa berhak mendapatkan
            pendidikan teknologi berkualitas tinggi yang relevan, terstruktur, dan terjangkau.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full -mt-16 relative z-10">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 text-center"
              >
                <p className="text-3xl font-bold font-heading text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="w-full py-20">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-4 text-slate-900">Visi Kami</h2>
              <p className="text-slate-600 leading-relaxed">
                Menjadi platform pembelajaran teknologi nomor satu di Indonesia yang melahirkan
                insinyur IoT dan software developer kelas dunia — yang tidak hanya paham teori,
                tapi siap berkontribusi nyata di industri global.
              </p>
            </div>
            <div className="bg-primary rounded-2xl p-8 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-4">Misi Kami</h2>
              <ul className="space-y-3 text-primary-foreground/90">
                {[
                  "Menyediakan kurikulum IoT & Software yang terstruktur dan selalu diperbarui.",
                  "Membangun ekosistem belajar yang inklusif dan terjangkau untuk semua kalangan.",
                  "Menghubungkan pelajar dengan mentor dan peluang karir di industri teknologi.",
                  "Mendorong lahirnya inovasi teknologi lokal yang berdampak global.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-white/60 shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Nilai-Nilai Kami</span>
            <h2 className="text-3xl font-bold font-heading mt-2 text-slate-900">Kenapa Koneksi.io?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(17,100,184,0.10)] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold font-heading text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="w-full py-20">
        <div className="container mx-auto px-4 md:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Tim Kami</span>
            <h2 className="text-3xl font-bold font-heading mt-2 text-slate-900">Dibangun oleh Praktisi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-200 mb-5 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400 font-heading">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold font-heading text-slate-900">{member.name}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-12">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <Award className="w-10 h-10 mx-auto mb-4 text-white/80" />
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Siap Mulai Perjalanan Belajarmu?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Bergabunglah bersama ribuan pelajar yang sudah mengembangkan karir mereka bersama Koneksi.io.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/katalog"
                  className={cn(buttonVariants({ variant: "secondary" }), "bg-white text-primary hover:bg-slate-100 rounded-full px-8")}
                >
                  Lihat Katalog Kursus
                </Link>
                <Link
                  href="/faq"
                  className={cn(buttonVariants({ variant: "outline" }), "bg-transparent border-white/40 text-white hover:bg-white/10 rounded-full px-8")}
                >
                  Baca FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}