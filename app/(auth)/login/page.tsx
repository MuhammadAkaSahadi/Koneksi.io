import Link from "next/link";
import { AuthForm } from "./auth-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10 bg-muted/40">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-heading font-bold text-2xl">K.</span>
              </div>
              <span className="sr-only">Koneksi.io</span>
            </Link>
            <h1 className="text-xl font-bold font-heading">Selamat datang kembali</h1>
            <p className="text-center text-sm text-muted-foreground">
              Masuk ke akun Anda untuk melanjutkan belajar.
            </p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
