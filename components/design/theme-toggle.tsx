"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      {/* resolvedTheme is undefined on the server; suppressHydrationWarning
          avoids a mismatch warning for this one harmless icon swap rather
          than adding a mounted-state effect (which trips the "no setState
          in effect" lint rule for zero real benefit here). */}
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </Button>
  );
}
