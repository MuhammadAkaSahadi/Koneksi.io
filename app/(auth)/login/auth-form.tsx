"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { login, signup } from "./actions";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function AuthForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isPending, startTransition] = React.useTransition();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  React.useEffect(() => {
    if (error) {
      toast.error("Terjadi kesalahan saat otentikasi. Silakan coba lagi.");
    }
  }, [error]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const action = isLogin ? login : signup;
      const result = await action(formData);
      
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                    >
                      Lupa password?
                    </a>
                  )}
                </div>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
              <Button variant="outline" className="w-full" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Masuk dengan Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                type="button"
                className="underline underline-offset-4 text-primary font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Daftar sekarang" : "Masuk"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        Dengan mengklik lanjutkan, Anda menyetujui <a href="#">Syarat Layanan</a>{" "}
        dan <a href="#">Kebijakan Privasi</a> kami.
      </div>
    </div>
  );
}
