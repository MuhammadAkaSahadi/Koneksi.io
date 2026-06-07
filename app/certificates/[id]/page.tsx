import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CertificateClient from "@/components/certificates/CertificateClient";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select(`
      profile:profiles (
        full_name
      ),
      theme:themes (
        title
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!certificate) {
    return {
      title: "Sertifikat Tidak Valid | Koneksi.io",
      description: "Sertifikat kelulusan tidak ditemukan atau tidak valid di database Koneksi.io.",
    };
  }

  const rawProfile = certificate.profile as any;
  const rawTheme = certificate.theme as any;

  const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
  const theme = Array.isArray(rawTheme) ? rawTheme[0] : rawTheme;

  const name = profile?.full_name || "Peserta";
  const course = theme?.title || "Materi Pembelajaran";

  return {
    title: `Verifikasi Sertifikat: ${name} - ${course} | Koneksi.io`,
    description: `Halaman verifikasi resmi kelulusan kelas ${course} di Koneksi.io atas nama ${name}. Verifikasi keabsahan sertifikat dan riwayat kelulusan secara real-time.`,
    openGraph: {
      title: `Sertifikat Kelulusan Koneksi.io: ${name}`,
      description: `Selamat kepada ${name} yang telah lulus dari kelas ${course}!`,
      type: "website",
    },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch certificate details with profiles and themes relations
  const { data: certificate, error } = await supabase
    .from("certificates")
    .select(`
      id,
      certificate_code,
      issued_at,
      profile:profiles (
        full_name,
        email
      ),
      theme:themes (
        id,
        title,
        slug
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !certificate) {
    notFound();
  }

  const rawProfile = certificate.profile as any;
  const rawTheme = certificate.theme as any;

  const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
  const theme = Array.isArray(rawTheme) ? rawTheme[0] : rawTheme;

  const normalizedCertificate = {
    id: certificate.id,
    certificate_code: certificate.certificate_code,
    issued_at: certificate.issued_at,
    profile: profile ? {
      full_name: profile.full_name || null,
      email: profile.email || null
    } : null,
    theme: theme ? {
      id: theme.id,
      title: theme.title || null,
      slug: theme.slug || null
    } : null
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[#0891b2] font-heading tracking-wider text-lg">
            Koneksi<span className="text-slate-800">.io</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Sertifikat Digital Resmi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50/50 pb-16">
        <CertificateClient certificate={normalizedCertificate as any} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} Koneksi.io. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="mt-1">Verifikasi ini disediakan langsung oleh platform pelatihan digital mandiri Koneksi.io.</p>
      </footer>
    </div>
  );
}
