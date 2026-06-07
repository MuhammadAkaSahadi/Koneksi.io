"use client";

import { useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, User, Phone, Lock, CreditCard, HelpCircle, QrCode, AlertCircle, Upload } from "lucide-react";
import { TransferProofUpload } from "@/components/checkout/TransferProofUpload";
import Image from "next/image";

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
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'midtrans'>('qris');
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [uniqueCodePreview] = useState(() => Math.floor(Math.random() * 900) + 100);
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

  const handlePayQRIS = async (values: CheckoutFormValues) => {
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk melanjutkan pembayaran.");
      router.push(`/login?next=/katalog/${theme.slug}`);
      return;
    }

    if (!transferProof) {
      toast.error("Silakan upload bukti transfer terlebih dahulu");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("themeId", theme.id);
      formData.append("themeTitle", theme.title);
      formData.append("price", theme.price_lifetime.toString());
      formData.append("fullName", values.fullName);
      formData.append("phone", values.phone);
      formData.append("transferProof", transferProof);

      const response = await fetch("/api/checkout-qris", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat memproses pembayaran");
      }

      toast.success(data.message || "Transaksi berhasil dibuat. Menunggu verifikasi admin.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("QRIS Payment Error:", error);
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
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

          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-left shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Metode Pembayaran</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <QrCode className={`w-6 h-6 ${paymentMethod === 'qris' ? 'text-primary' : 'text-slate-600'}`} />
                <div className="text-center">
                  <p className={`text-sm font-bold ${paymentMethod === 'qris' ? 'text-primary' : 'text-slate-700'}`}>
                    QRIS
                  </p>
                  <p className="text-xs text-slate-500">Scan & Bayar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('midtrans')}
                disabled={true}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 opacity-50 cursor-not-allowed relative"
              >
                <CreditCard className="w-6 h-6 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500">Payment Gateway</p>
                  <p className="text-xs text-slate-400">Kartu & E-Wallet</p>
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Maintenance
                </div>
              </button>
            </div>

            {/* QRIS Instructions */}
            {paymentMethod === 'qris' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 space-y-1">
                    <p className="font-bold">Cara Pembayaran QRIS:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-1">
                      <li>Scan QRIS dengan aplikasi e-wallet atau m-banking Anda</li>
                      <li>Bayar sesuai nominal yang tertera (harus PERSIS dengan kode unik)</li>
                      <li>Screenshot bukti pembayaran</li>
                      <li>Upload bukti di kolom yang tersedia</li>
                      <li>Admin akan memverifikasi dalam 1x24 jam</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payments Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left sticky top-24 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Detail Pembayaran
            </h3>

            {/* QRIS Payment Section */}
            {paymentMethod === 'qris' && (
              <div className="space-y-4">
                {/* QRIS Image */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-3 text-center">
                    Scan QRIS untuk Pembayaran
                  </p>
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-white rounded-lg overflow-hidden border-2 border-slate-300">
                    <Image
                      src="/qris-koneksi.jpeg"
                      alt="QRIS Koneksi.io"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    QRIS DANA - Koneksi.io
                  </p>
                </div>

                {/* Upload Bukti Transfer */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Upload Bukti Transfer <span className="text-red-500">*</span>
                  </label>
                  <TransferProofUpload
                    value={transferProof}
                    onChange={setTransferProof}
                    disabled={isProcessing}
                  />
                </div>

                <div className="h-px bg-slate-100" />
              </div>
            )}

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
                  <span>Harga Course</span>
                  <span className="text-slate-800 font-bold">{formattedPrice}</span>
                </div>
                {paymentMethod === 'qris' && (
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Kode Unik</span>
                    <span className="text-primary font-bold font-mono">+{uniqueCodePreview}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-650 uppercase tracking-wider">Total Tagihan</span>
                <span className="text-base font-extrabold text-primary font-heading">
                  {paymentMethod === 'qris'
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(theme.price_lifetime + uniqueCodePreview)
                    : formattedPrice
                  }
                </span>
              </div>
            </div>

            <div className="pt-2">
              {user ? (
                paymentMethod === 'qris' ? (
                  <Button
                    size="lg"
                    className="w-full h-12 text-xs font-extrabold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm transition-transform active:scale-98 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit(handlePayQRIS)}
                    disabled={isProcessing || !transferProof}
                  >
                    {isProcessing ? "Memproses..." : "Upload Bukti & Submit"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-12 text-xs font-extrabold bg-slate-300 text-slate-500 rounded-xl cursor-not-allowed border-0"
                    disabled={true}
                  >
                    Fitur Sedang Maintenance
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className="w-full h-12 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border-0"
                  onClick={handleAuthRedirect}
                >
                  Masuk untuk Membeli
                </Button>
              )}

              {paymentMethod === 'qris' && !transferProof && user && (
                <p className="text-xs text-amber-600 font-semibold mt-2 text-center">
                  Silakan upload bukti transfer terlebih dahulu
                </p>
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
