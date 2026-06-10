"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Loader2, 
  Sparkles, 
  AlertTriangle,
  Calendar,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { submitFeedback } from "./actions";
import { useRouter } from "next/navigation";

const feedbackSchema = z.object({
  type: z.enum(["kritik", "saran"], {
    message: "Pilih jenis masukan Anda (Kritik atau Saran)",
  }),
  content: z.string().min(10, "Kritik atau saran minimal 10 karakter"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface Feedback {
  id: string;
  type: "kritik" | "saran";
  content: string;
  created_at: string;
}

interface FeedbackFormProps {
  feedbacks: Feedback[];
}

export function FeedbackForm({ feedbacks }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "saran",
      content: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(values);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Terima kasih! Kritik/Saran Anda telah berhasil dikirim.");
        reset({ type: "saran", content: "" });
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim masukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Kritik & Saran
        </h1>
        <p className="text-slate-500 text-sm">
          Bantu kami meningkatkan platform Koneksi.io menjadi lebih baik. Kirimkan kritik konstruktif atau saran fitur baru Anda di bawah ini.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        {/* Form Column */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0891b2]" />
            Formulir Masukan
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Switcher */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Pilih Jenis Masukan</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Saran */}
                <button
                  type="button"
                  onClick={() => setValue("type", "saran")}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    selectedType === "saran"
                      ? "border-[#0891b2] bg-cyan-50/50 text-[#0891b2] ring-2 ring-[#0891b2]/10"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${selectedType === "saran" ? "text-[#0891b2]" : "text-slate-400"}`} />
                  <span>Saran Fitur / Ide</span>
                </button>

                {/* Kritik */}
                <button
                  type="button"
                  onClick={() => setValue("type", "kritik")}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    selectedType === "kritik"
                      ? "border-amber-500 bg-amber-50/30 text-amber-700 ring-2 ring-amber-500/10"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${selectedType === "kritik" ? "text-amber-500" : "text-slate-400"}`} />
                  <span>Kritik / Keluhan</span>
                </button>
              </div>
              {errors.type && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold text-slate-700">
                Isi Masukan
              </Label>
              <textarea
                id="content"
                {...register("content")}
                rows={5}
                placeholder={
                  selectedType === "saran"
                    ? "Tuliskan saran Anda tentang fitur baru, peningkatan materi, atau ide pengembangan lainnya..."
                    : "Tuliskan keluhan atau kritik konstruktif Anda terkait error, kendala platform, atau hal lainnya..."
                }
                className={`w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-sm transition-colors outline-none placeholder:text-slate-400 focus-visible:border-[#0891b2] focus-visible:ring-3 focus-visible:ring-[#0891b2]/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 ${
                  errors.content ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/10" : "border-slate-200"
                }`}
              />
              <div className="flex justify-between items-center text-xs">
                {errors.content ? (
                  <p className="text-rose-500 font-medium">{errors.content.message}</p>
                ) : (
                  <p className="text-slate-400 font-medium">Min. 10 karakter</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-11 text-sm font-semibold transition-all duration-200 ${
                selectedType === "saran" 
                  ? "bg-[#0891b2] hover:bg-[#0891b2]/90 text-white cursor-pointer" 
                  : "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim Masukan...
                </>
              ) : (
                "Kirim Masukan"
              )}
            </Button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
            <h2 className="text-base font-bold text-slate-900 font-heading mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Riwayat Masukan Anda
            </h2>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {feedbacks.length > 0 ? (
                feedbacks.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      {item.type === "saran" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-cyan-50 text-[#0891b2] px-2 py-0.5 rounded-full border border-cyan-100/50">
                          <Sparkles className="h-3 w-3" />
                          Saran
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100/50">
                          <AlertTriangle className="h-3 w-3" />
                          Kritik
                        </span>
                      )}
                      {/* <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span> */}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed break-words whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-1">Belum Ada Masukan</h3>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Kritik & saran yang Anda kirimkan akan tampil di sini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
