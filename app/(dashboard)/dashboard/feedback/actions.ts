"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const feedbackSchema = z.object({
  type: z.enum(["kritik", "saran"], {
    message: "Tipe masukan harus berupa 'kritik' atau 'saran'",
  }),
  content: z.string().min(10, "Konten minimal 10 karakter"),
});

export async function submitFeedback(values: { type: string; content: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validasi input
  const validation = feedbackSchema.safeParse(values);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((issue) => issue.message).join(", ");
    return { error: errorMsg };
  }

  // Insert data
  const { error } = await supabase.from("feedbacks").insert({
    user_id: user.id,
    type: validation.data.type,
    content: validation.data.content,
  });

  if (error) {
    return { error: `Gagal mengirim masukan: ${error.message}` };
  }

  // Revalidate cache
  revalidatePath("/dashboard/feedback");
  revalidatePath("/admin/feedback");

  return { success: true };
}
