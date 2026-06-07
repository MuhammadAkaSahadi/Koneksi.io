import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Eye, Calendar, ShieldCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sertifikat Saya | Koneksi.io",
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch certificates with related theme details
  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(`
      id,
      certificate_code,
      issued_at,
      theme:themes (
        id,
        title,
        slug,
        thumbnail_url
      )
    `)
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hasCertificates = certificates && certificates.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Sertifikat Saya</h1>
          <p className="text-sm text-slate-600 mt-1">
            Lihat, cetak, dan bagikan sertifikat kelulusan kelas IoT & Tech milikmu.
          </p>
        </div>
      </div>

      {!hasCertificates ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 font-heading">
                Belum ada sertifikat
              </p>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Kamu belum menyelesaikan seluruh materi di kelas yang kamu ikuti. Selesaikan semua bab/modul untuk menerbitkan sertifikat pertamamu!
              </p>
            </div>
            <Link href="/dashboard/courses" className="mt-2 w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-bold rounded-xl px-6 h-11 border-0 cursor-pointer flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Mulai Belajar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert: any) => {
            const themeData = cert.theme;
            return (
              <div 
                key={cert.id} 
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between gap-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                      <h3 className="font-bold text-base text-slate-900 font-heading leading-snug group-hover:text-[#0891b2] transition-colors mt-2">
                        {themeData?.title || "Materi Pembelajaran"}
                      </h3>
                    </div>
                    {themeData?.thumbnail_url ? (
                      <img 
                        src={themeData.thumbnail_url} 
                        alt={themeData.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                        <Award className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    <div className="space-y-1 text-left">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Tanggal Lulus</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(cert.issued_at)}
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">ID Sertifikat</span>
                      <div className="text-slate-700 font-mono font-medium tracking-wide bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit">
                        {cert.certificate_code}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <Link href={`/certificates/${cert.id}`} target="_blank" className="block w-full">
                    <Button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs h-10 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <Eye className="h-4 w-4 text-slate-500" />
                      Lihat & Unduh Sertifikat
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
