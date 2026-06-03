import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, BookOpen } from "lucide-react";
import { StatsWidgetGrid } from "@/components/dashboard/StatsWidgetGrid";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { ExploreModules } from "@/components/dashboard/ExploreModules";

export const metadata = {
  title: "Dashboard | Koneksi.io",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cek apakah user adalah admin
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    redirect("/admin");
  }

  // Fetch subscriptions
  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString())
    .maybeSingle();

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, themes(*)")
    .eq("user_id", user.id);

  const enrolledThemeIds = enrollments?.map((e: any) => e.theme_id).filter(Boolean) || [];

  // Hitung stats & progress secara dinamis
  let totalClasses = enrolledThemeIds.length;
  let inProgressClasses = 0;
  let certificatesCount = 0;
  let latestProgress: any = null;

  if (enrolledThemeIds.length > 0) {
    // Ambil chapter dari tema yang dimiliki
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, theme_id")
      .in("theme_id", enrolledThemeIds);

    const chapterIds = chapters?.map((c) => c.id) || [];

    // Ambil seluruh lesson untuk chapters tersebut
    let lessons: any[] = [];
    if (chapterIds.length > 0) {
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, chapter_id, title")
        .in("chapter_id", chapterIds);
      lessons = lessonsData || [];
    }

    // Ambil riwayat progres belajar user
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*, lessons(*, chapters(*, themes(*)))")
      .eq("user_id", user.id);

    // Hitung progress per tema
    const themeProgressMap = new Map<string, { total: number; completed: number }>();
    enrolledThemeIds.forEach((id) => {
      themeProgressMap.set(id, { total: 0, completed: 0 });
    });

    // Petakan jumlah lesson ke tiap tema
    lessons.forEach((lesson) => {
      const chapter = chapters?.find((c) => c.id === lesson.chapter_id);
      if (chapter) {
        const current = themeProgressMap.get(chapter.theme_id);
        if (current) {
          current.total += 1;
        }
      }
    });

    // Petakan progres penyelesaian ke tiap tema
    progress?.forEach((p) => {
      if (p.is_completed) {
        const chapter = chapters?.find((c) => c.id === p.lessons?.chapter_id);
        if (chapter) {
          const current = themeProgressMap.get(chapter.theme_id);
          if (current) {
            current.completed += 1;
          }
        }
      }
    });

    // Hitung berapa modul yang in-progress dan selesai (sertifikat)
    themeProgressMap.forEach((val, themeId) => {
      if (val.total > 0) {
        const percent = Math.round((val.completed / val.total) * 100);
        if (percent > 0 && percent < 100) {
          inProgressClasses += 1;
        } else if (percent === 100) {
          certificatesCount += 1;
        }
      }
    });

    // Dapatkan data modul terakhir yang diakses berdasarkan updated_at
    if (progress && progress.length > 0) {
      const sortedProgress = [...progress].sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      const latest = sortedProgress[0];
      if (latest && latest.lessons?.chapters?.themes) {
        const theme = latest.lessons.chapters.themes;
        const themeProgress = themeProgressMap.get(theme.id);
        const pct = themeProgress && themeProgress.total > 0 
          ? Math.round((themeProgress.completed / themeProgress.total) * 100)
          : 0;

        latestProgress = {
          themeTitle: theme.title,
          themeSlug: theme.slug,
          lessonTitle: latest.lessons.title,
          lessonId: latest.lessons.id,
          category: theme.title.toLowerCase().includes("esp32") ? "Hardware (IoT)" : "IoT Cloud / Web",
          thumbnailUrl: theme.thumbnail_url,
          progressPercent: pct
        };
      }
    }

    // Fallback ke tema pertama jika progress belum terbuat sama sekali
    if (!latestProgress && enrollments && enrollments.length > 0) {
      const firstEnroll = enrollments[0];
      if (firstEnroll.themes) {
        const themeId = firstEnroll.themes.id;
        const firstThemeChapter = chapters?.find((c) => c.theme_id === themeId);
        let firstLesson: any = null;
        if (firstThemeChapter) {
          firstLesson = lessons.find((l) => l.chapter_id === firstThemeChapter.id);
        }

        latestProgress = {
          themeTitle: firstEnroll.themes.title,
          themeSlug: firstEnroll.themes.slug,
          lessonTitle: firstLesson ? firstLesson.title : "Setup & Pendahuluan",
          lessonId: firstLesson ? firstLesson.id : "",
          category: firstEnroll.themes.title.toLowerCase().includes("esp32") ? "Hardware (IoT)" : "IoT Cloud / Web",
          thumbnailUrl: firstEnroll.themes.thumbnail_url,
          progressPercent: 0
        };
      }
    }
  }

  // Tentukan paket keanggotaan
  let packageStatus: "lifetime" | "subscription" | "trial" | "expired" = "trial";
  if (activeSub) {
    packageStatus = "subscription";
  } else if (totalClasses > 0) {
    packageStatus = "lifetime";
  }

  // Ambil data modul rekomendasi (modul yang belum dimiliki oleh user)
  let exploreQuery = supabase.from("themes").select("*");
  if (enrolledThemeIds.length > 0) {
    // Supabase JS syntax untuk not in: .not("id", "in", '("uuid1","uuid2")')
    const formattedIds = enrolledThemeIds.map(id => `"${id}"`).join(",");
    exploreQuery = exploreQuery.not("id", "in", `(${formattedIds})`);
  }
  const { data: exploreThemes } = await exploreQuery.limit(3);

  // Ambil tanggal saat ini (Indonesian locale)
  const indonesianDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const buyerName = profile?.full_name || "Sobat IoT";

  const stats = {
    packageStatus,
    totalClasses,
    inProgressClasses,
    certificatesCount
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Halo, {buyerName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pantau perkembangan aktivitas, progres belajar, dan modul kamu hari ini.
          </p>
        </div>

        {/* Date/Time Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-xs font-semibold text-slate-600 max-w-fit">
          <Calendar className="h-4 w-4 text-[#0891b2]" />
          <span>{indonesianDate}</span>
        </div>
      </div>

      {/* 2. Top Stats Widget (Grid 4 Kolom) */}
      <StatsWidgetGrid stats={stats} />

      {/* 3. Section Lanjutkan Belajar */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-heading">
          Lanjutkan Belajar
        </h2>
        <ContinueLearning latestProgress={latestProgress} />
      </div>

      {/* 4. Section Eksplorasi Modul Lainnya */}
      {exploreThemes && exploreThemes.length > 0 && (
        <ExploreModules themes={exploreThemes} />
      )}

    </div>
  );
}
