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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { signout } from "@/app/(auth)/login/actions";
import Link from "next/link";
import { useTransition } from "react";

export function UserNav({ user, isAdmin }: { user: User; isAdmin?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleSignout = () => {
    startTransition(() => {
      signout();
    });
  };

  const initials = user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Pengguna</p>
              <p className="text-xs leading-none text-muted-foreground">
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
        <DropdownMenuItem render={<Link href="/dashboard/settings" className="cursor-pointer w-full" />}>
          Pengaturan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignout} disabled={isPending} className="text-destructive cursor-pointer">
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
