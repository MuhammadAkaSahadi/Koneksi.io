"use client";

import { useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, User, Phone, Lock, CreditCard, HelpCircle } from "lucide-react";

const checkoutSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phone: z
    .string()
    .min(16, "Nomor telepon minimal 9 digit")
    .max(16, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+]+$/, "Nomor telepon hanya boleh berisi angka dan tanda +"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface KatalogCheckoutFormProps {
  theme: {
    id: string;
    title: string;
    slug: string;
    price_lifetime: number;
    thumbnail_url: string | null;
  };
  user: {
    id: string;
    email: string;
  } | null;
  profile: {
    full_name: string | null;
  } | null;
}

export function KatalogCheckoutForm({ theme, user, profile }: KatalogCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: profile?.full_name || user?.email?.split("@")[0] || "",
      phone: "",
    },
  });

  const handlePay = async (values: CheckoutFormValues) => {
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk melanjutkan pembayaran.");
      router.push(`/login?next=/katalog/${theme.slug}`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: theme.id,
          themeTitle: theme.title,
          price: theme.price_lifetime,
          fullName: values.fullName,
          phone: values.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat memproses pembayaran");
      }

      interface MidtransSnap {
        pay: (
          token: string,
          options: {
            onSuccess?: () => void;
            onPending?: () => void;
            onError?: () => void;
            onClose?: () => void;
          }
        ) => void;
      }
      const globalWindow = window as unknown as { snap?: MidtransSnap };

      if (typeof window !== "undefined" && globalWindow.snap) {
        globalWindow.snap.pay(data.token, {
          onSuccess: function () {
            toast.success("Pembayaran berhasil!");
            router.push(`/dashboard`);
          },
          onPending: function () {
            toast.info("Menunggu pembayaran Anda.");
            router.push(`/dashboard`);
          },
          onError: function () {
            toast.error("Pembayaran gagal!");
            setIsProcessing(false);
          },
          onClose: function () {
            toast.info("Anda menutup popup pembayaran.");
            setIsProcessing(false);
          },
        });
      } else {
        throw new Error("Midtrans Snap SDK gagal dimuat. Silakan muat ulang halaman.");
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(errMsg);
      setIsProcessing(false);
    }
  };

  const handleAuthRedirect = () => {
    toast.info("Mengarahkan Anda ke halaman login...");
    router.push(`/login?next=/katalog/${theme.slug}`);
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(theme.price_lifetime);

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 text-left shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Informasi Pembeli</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lengkapi informasi berikut untuk keperluan sertifikat dan pengiriman bukti pembayaran.
              </p>
            </div>

            <form onSubmit={handleSubmit(handlePay)} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    disabled={!!user} // Email locked for logged in user
                    className={`pl-10 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 w-full text-xs transition-colors ${
                      user ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    placeholder="nama@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[11px] font-semibold">{errors.email.message}</p>
                )}
                {user && (
                  <p className="text-[10px] text-slate-400">
                    Email terikat dengan akun Anda yang sedang aktif.
                  </p>
                )}
              </div>

              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    {...register("fullName")}
                    className="pl-10 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 w-full text-xs transition-colors"
                    placeholder="Nama lengkap sesuai KTP"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-[11px] font-semibold">{errors.fullName.message}</p>
                )}
                <p className="text-[10px] text-slate-450">
                  Gunakan nama asli Anda untuk pencetakan e-sertifikat kelulusan.
                </p>
              </div>

              {/* Phone number field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    {...register("phone")}
                    className="pl-10 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 w-full text-xs transition-colors"
                    placeholder="628123456789"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-[11px] font-semibold">{errors.phone.message}</p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Payments Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left sticky top-24 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Detail Pembayaran
            </h3>

            <div className="space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading line-clamp-2 leading-relaxed">
                  {theme.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Akses Selamanya (Lifetime)</p>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>SubTotal</span>
                  <span className="text-slate-800 font-bold">{formattedPrice}</span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-650 uppercase tracking-wider">Total Tagihan</span>
                <span className="text-base font-extrabold text-primary font-heading">{formattedPrice}</span>
              </div>
            </div>

            <div className="pt-2">
              {user ? (
                <Button
                  size="lg"
                  className="w-full h-12 text-xs font-extrabold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm transition-transform active:scale-98 cursor-pointer border-0"
                  onClick={handleSubmit(handlePay)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Memproses..." : `Bayar Sekarang — ${formattedPrice}`}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-12 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border-0"
                  onClick={handleAuthRedirect}
                >
                  Masuk untuk Membeli
                </Button>
              )}
            </div>

            <div className="space-y-2 text-center pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold hover:text-slate-700 transition-colors cursor-pointer justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
                Lihat metode pembayaran yang tersedia
              </span>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg px-2">
                <Lock className="w-3.5 h-3.5" />
                Pembayaran aman - Terenkripsi SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
