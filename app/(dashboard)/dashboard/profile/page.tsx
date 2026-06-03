import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "./ProfileEditForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <ProfileEditForm
      user={{
        id: user.id,
        email: user.email || "",
      }}
      profile={{
        full_name: profile?.full_name || null,
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || null,
      }}
    />
  );
}
