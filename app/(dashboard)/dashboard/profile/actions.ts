"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl: string | undefined;

  // Upload avatar if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(fileName, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload error: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatar")
      .getPublicUrl(fileName);

    avatarUrl = publicUrl;
  }

  // Update profile
  const updateData: {
    full_name: string;
    phone: string;
    avatar_url?: string;
  } = {
    full_name: fullName,
    phone: phone,
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
