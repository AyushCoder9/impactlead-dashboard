"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Command } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/admin/command-palette";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { Logo } from "@/components/design/logo";

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CommandPalette />
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <Logo className="size-6" />
          LeadDesk <span className="text-muted-foreground">/ admin</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <kbd className="hidden items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-xs sm:flex">
            <Command className="size-3" />K
          </kbd>
          <ThemeToggle />
          <span>{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
