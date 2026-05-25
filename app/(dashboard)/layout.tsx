import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayoutContent } from "@/components/layout/DashboardLayoutContent";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin, full_name, avatar_url, email")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin || false;

  return (
    <DashboardLayoutContent
      user={user}
      profile={profile || null}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardLayoutContent>
  );
}
