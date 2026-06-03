"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { signout } from "@/app/(auth)/login/actions";
import Link from "next/link";
import { useTransition } from "react";

interface UserNavProps {
  user: User;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
  isAdmin?: boolean;
}

export function UserNav({ user, profile, isAdmin }: UserNavProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignout = () => {
    startTransition(() => {
      signout();
    });
  };

  const name = profile?.full_name || "Pengguna";
  const initials = profile?.full_name
    ? profile.full_name.substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 border border-slate-200" />}>
        <Avatar className="h-9 w-9">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={name} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-1.5" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-slate-800">{name}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" className="cursor-pointer w-full" />}>
            Admin Dashboard
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem render={<Link href="/dashboard" className="cursor-pointer w-full" />}>
            Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/dashboard/profile" className="cursor-pointer w-full" />}>
          Pengaturan Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignout} disabled={isPending} className="text-destructive cursor-pointer font-medium">
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
