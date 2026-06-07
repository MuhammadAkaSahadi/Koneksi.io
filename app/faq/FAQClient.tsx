"use client";

import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const faqs = [
  {
    category: "Umum",
    items: [
      {
        q: "Apa itu Koneksi.io?",
        a: "Koneksi.io adalah platform kursus IoT dan Software Engineering mandiri yang dirancang khusus untuk talenta digital Indonesia. Kami menyediakan jalur belajar terstruktur mulai dari hardware (IoT) hingga software development.",
      },
      {
        q: "Siapa yang cocok belajar di Koneksi.io?",
        a: "Koneksi.io cocok untuk siapa saja — pelajar, mahasiswa, maupun profesional yang ingin memahami teknologi IoT dan software engineering secara mendalam dan terstruktur. Tidak ada prasyarat khusus untuk memulai.",
      },
      {
        q: "Apakah ada sertifikat setelah menyelesaikan kursus?",
        a: "Ya! Setelah menyelesaikan seluruh materi dalam sebuah tema kursus, kamu akan mendapatkan sertifikat penyelesaian digital yang dapat kamu bagikan ke LinkedIn atau portofolio profesional kamu.",
      },
    ],
  },
  {
    category: "Akses & Konten",
    items: [
      {
        q: "Apa bedanya akses Gratis dan Lifetime?",
        a: "Setiap tema kursus memiliki 2 sub-bab gratis (Pendahuluan & Setup) yang bisa diakses tanpa membayar. Untuk mengakses seluruh materi, kamu bisa membeli akses Lifetime untuk tema tersebut atau berlangganan paket Subscription.",
      },
      {
        q: "Apa itu paket Subscription?",
        a: "Paket Subscription memberikan akses ke semua tema kursus yang tersedia selama periode langganan (3 bulan). Ini adalah pilihan terbaik jika kamu ingin menjelajahi banyak topik sekaligus dengan harga yang lebih hemat.",
      },
      {
        q: "Apakah materi bisa diakses selamanya setelah membeli Lifetime?",
        a: "Ya! Pembelian Lifetime memberikan akses permanen ke materi tema tersebut, termasuk semua pembaruan konten di masa mendatang tanpa biaya tambahan.",
      },
      {
        q: "Apakah ada aplikasi mobile untuk Koneksi.io?",
        a: "Saat ini Koneksi.io dapat diakses melalui browser di perangkat mobile maupun desktop. Platform kami sudah dioptimalkan untuk pengalaman belajar yang nyaman di semua ukuran layar.",
      },
    ],
  },
  {
    category: "Pembayaran",
    items: [
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Kami menggunakan Midtrans sebagai payment gateway, sehingga kamu bisa membayar menggunakan transfer bank (BCA, BNI, BRI, Mandiri), dompet digital (GoPay, OVO, Dana, ShopeePay), kartu kredit/debit, dan Indomaret/Alfamart.",
      },
      {
        q: "Apakah ada refund jika saya tidak puas?",
        a: "Kami menawarkan garansi uang kembali 7 hari jika kamu merasa materi tidak sesuai ekspektasi. Hubungi tim support kami melalui email dan kami akan memproses refund dalam 3–5 hari kerja.",
      },
      {
        q: "Apakah ada diskon untuk pelajar atau mahasiswa?",
        a: "Ya! Kami memiliki program diskon khusus untuk pelajar dan mahasiswa. Kirimkan bukti status aktif kamu (KTM atau surat keterangan) ke email kami untuk mendapatkan kode diskon eksklusif.",
      },
    ],
  },
  {
    category: "Teknis",
    items: [
      {
        q: "Apa yang harus saya persiapkan untuk kursus Hardware (IoT)?",
        a: "Untuk kursus IoT, kamu membutuhkan perangkat mikrokontroler (seperti ESP32 atau Arduino) dan komponen elektronik dasar. Setiap tema akan mencantumkan daftar komponen yang dibutuhkan di halaman detail kursus.",
      },
      {
        q: "Bagaimana jika saya mengalami masalah teknis saat belajar?",
        a: "Kamu bisa menghubungi tim support kami melalui fitur live chat di platform atau mengirim email ke support@koneksi.io. Kami juga memiliki komunitas Discord aktif di mana sesama pelajar dan mentor siap membantu.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-200",
        open
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-primary/30"
      )}
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800 text-sm md:text-base leading-snug">
          {q}
        </span>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-primary shrink-0 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQClient() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <section className="w-full pt-12 pb-24 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

        <div className="container mx-auto px-4 md:px-12 relative z-10">
          <nav
            className="flex text-sm text-primary-foreground/80 mb-6"
            aria-label="Breadcrumb"
          >
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-white font-medium">FAQ</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-heading">
              FAQ
            </h1>
          </div>

          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Pertanyaan yang sering ditanyakan seputar platform, konten, dan
            pembayaran di Koneksi.io.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="w-full py-12 -mt-8">
        <div className="container mx-auto px-4 md:px-12 max-w-3xl">
          <div className="space-y-10">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 pl-1">
                  {section.category}
                </h2>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/20 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg font-heading text-slate-900 mb-1">
                Masih ada pertanyaan?
              </h3>

              <p className="text-slate-500 text-sm">
                Tim kami siap membantu kamu melalui email atau Discord komunitas
                Koneksi.io.
              </p>
            </div>

            <div className="flex gap-3 shrink-0 ml-auto">
              <a
                href="mailto:support@koneksi.io"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full"
                )}
              >
                Email Kami
              </a>

              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-full"
                )}
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}