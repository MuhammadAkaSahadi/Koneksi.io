"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CheckoutClient({ theme }: { theme: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: theme.id,
          themeTitle: theme.title,
          price: theme.price_lifetime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat memproses pembayaran");
      }

      // @ts-ignore
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          toast.success("Pembayaran berhasil!");
          router.push(`/dashboard`);
        },
        onPending: function (result: any) {
          toast.info("Menunggu pembayaran Anda.");
          router.push(`/dashboard`);
        },
        onError: function (result: any) {
          toast.error("Pembayaran gagal!");
          setIsProcessing(false);
        },
        onClose: function () {
          toast.info("Anda menutup popup pembayaran.");
          setIsProcessing(false);
        },
      });
    } catch (error: any) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Button
        size="lg"
        className="w-full h-14 text-base font-bold"
        onClick={handlePay}
        disabled={isProcessing}
      >
        {isProcessing ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </>
  );
}
