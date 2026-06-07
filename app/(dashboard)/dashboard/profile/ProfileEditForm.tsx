"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Phone, Upload, Loader2 } from "lucide-react";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phone: z
    .string()
    .min(9, "Nomor telepon minimal 9 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+]+$/, "Nomor telepon hanya boleh berisi angka dan tanda +"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: {
    id: string;
    email: string;
  };
  profile: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}

export function ProfileEditForm({ user, profile }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name || "",
      phone: profile.phone || "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName);
      formData.append("phone", values.phone);

      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append("avatar", fileInput.files[0]);
      }

      const result = await updateProfile(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profil berhasil diperbarui");
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Profil</h1>
        <p className="text-slate-600 mt-2">
          Perbarui informasi profil Anda
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4 p-6 bg-slate-50 rounded-xl">
          <Avatar size="lg" className="w-24 h-24">
            <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
            <AvatarFallback>
              <User className="w-12 h-12 text-slate-400" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Avatar
            </Button>
            <p className="text-xs text-slate-500">
              PNG, JPG, atau GIF (Maksimal 5MB)
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            <User className="w-4 h-4" />
            Nama Lengkap
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="Masukkan nama lengkap"
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            <Phone className="w-4 h-4" />
            Nomor Telepon
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="628123456789"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="bg-slate-100 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">
            Email tidak dapat diubah
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
