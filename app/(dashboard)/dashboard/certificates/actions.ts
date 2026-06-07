"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function claimCertificate(themeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Silakan masuk terlebih dahulu." };
  }

  try {
    // 1. Verify user enrollment for the theme
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("theme_id", themeId)
      .maybeSingle();

    if (enrollError) {
      return { error: `Gagal memverifikasi akses kelas: ${enrollError.message}` };
    }

    if (!enrollment) {
      return { error: "Anda belum terdaftar/membeli kelas ini." };
    }

    // 2. Fetch all chapters & lessons in this theme
    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .select(`
        id,
        title,
        chapters (
          id,
          lessons (
            id
          )
        )
      `)
      .eq("id", themeId)
      .single();

    if (themeError || !theme) {
      return { error: "Kelas tidak ditemukan." };
    }

    // Extract all lesson IDs
    const allLessonIds = theme.chapters?.flatMap((c: any) => c.lessons?.map((l: any) => l.id) || []) || [];

    if (allLessonIds.length === 0) {
      return { error: "Kelas ini belum memiliki materi pembelajaran." };
    }

    // 3. Fetch completed progress for this user on these lessons
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .in("lesson_id", allLessonIds);

    if (progressError) {
      return { error: `Gagal memuat progres pembelajaran: ${progressError.message}` };
    }

    const completedLessonIds = progressData?.map((p: any) => p.lesson_id) || [];

    // Verify if all lessons of the course are completed
    const isCompleted = allLessonIds.every((id: string) => completedLessonIds.includes(id));

    if (!isCompleted) {
      return { error: "Anda belum menyelesaikan semua materi dalam kelas ini." };
    }

    // 4. Check if a certificate has already been generated
    const { data: existingCert, error: certFetchError } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("theme_id", themeId)
      .maybeSingle();

    if (certFetchError) {
      return { error: `Gagal memverifikasi status sertifikat: ${certFetchError.message}` };
    }

    if (existingCert) {
      return { success: true, certificateId: existingCert.id };
    }

    // 5. Generate a unique certificate code: KNS-YYYYMMDD-[4 RANDOM DIGITS]
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${day}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const certificateCode = `KNS-${dateStr}-${randomDigits}`;

    // 6. Insert new certificate
    const { data: newCert, error: insertError } = await supabase
      .from("certificates")
      .insert([
        {
          user_id: user.id,
          theme_id: themeId,
          certificate_code: certificateCode,
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      return { error: `Gagal menerbitkan sertifikat: ${insertError.message}` };
    }

    // Revalidate paths to update UI
    revalidatePath("/dashboard/certificates");
    revalidatePath(`/player/${themeId}`);

    return { success: true, certificateId: newCert.id };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan server saat memproses sertifikat." };
  }
}
