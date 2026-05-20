import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ themeSlug: string }>;
}) {
  const supabase = await createClient();
  const { themeSlug } = await params;

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/checkout/${themeSlug}`);
  }

  // Fetch theme
  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("slug", themeSlug)
    .single();

  if (!theme) {
    notFound();
  }

  // Check if already enrolled
  const { data: enrolled } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("theme_id", theme.id)
    .single();

  if (enrolled) {
    redirect(`/dashboard`); // Already enrolled, go to dashboard
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href={`/katalog/${theme.slug}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali ke Detail Kursus
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-slate-900">Checkout</h1>
          <p className="text-slate-500 mt-2">Selesaikan pembayaran untuk mulai belajar materi premium.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-24 h-16 bg-slate-200 rounded-md overflow-hidden shrink-0">
                    {theme.thumbnail_url ? (
                      <img src={theme.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{theme.title}</h3>
                    <p className="text-sm text-slate-500">Akses Lifetime</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Informasi Akun</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="border-slate-200 shadow-sm sticky top-24">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Harga Normal</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(theme.price_lifetime)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Diskon</span>
                  <span className="font-medium text-green-600">- Rp 0</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total Tagihan</span>
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(theme.price_lifetime)}
                  </span>
                </div>
                <div className="pt-4">
                  <CheckoutClient theme={theme} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
