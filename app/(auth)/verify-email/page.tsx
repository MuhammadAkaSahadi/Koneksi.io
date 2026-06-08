"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border shadow-md overflow-hidden bg-card">
        <CardContent className="pt-8 pb-8 px-6 text-center">
          <div className="flex flex-col gap-6">
            {/* Animated Icon Container */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10 text-primary animate-pulse"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5z"
                />
              </svg>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground border-2 border-background shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold font-heading text-foreground tracking-tight">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed px-2">
                Silakan cek email Anda untuk memverifikasi akun Anda sebelum melanjutkan.
              </p>
            </div>

            {/* Registered Email Showcase */}
            {email && (
              <div className="rounded-lg bg-muted p-3 border border-border/50 text-xs text-muted-foreground break-all">
                Tautan verifikasi telah dikirim ke: <span className="font-semibold text-foreground">{decodeURIComponent(email)}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "w-full text-center font-medium"
                )}
              >
                Masuk Sekarang
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Help text */}
      <p className="text-center text-xs text-muted-foreground">
        Tidak menerima email? Periksa folder spam Anda atau coba daftar lagi.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10 bg-muted/40">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-heading font-bold text-2xl">K.</span>
              </div>
              <span className="sr-only">Koneksi.io</span>
            </Link>
          </div>
          
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
