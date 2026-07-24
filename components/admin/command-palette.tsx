"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, LayoutDashboard, Search, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { authClient } from "@/lib/auth-client";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => router.push("/admin"))}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/demo"))}>
            <Sparkles /> View live demo
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              run(() => {
                const input = document.querySelector<HTMLInputElement>(
                  "input[placeholder='Search name, email, message…']",
                );
                input?.focus();
              })
            }
          >
            <Search /> Focus lead search
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.location.assign("/api/leads/export"))}>
            <Download /> Export leads as CSV
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(async () => {
                await authClient.signOut();
                router.push("/admin/login");
                router.refresh();
              })
            }
          >
            <LogOut /> Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
