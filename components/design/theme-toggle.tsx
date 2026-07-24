"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // suppressHydrationWarning only covers text-content mismatches, not
    // swapping one child element for another (Sun vs Moon are different
    // elements) — that's a real hydration bug, not just a noisy warning,
    // since resolvedTheme is genuinely undefined on the server and only
    // resolves after mount. The mounted-gate is the correct fix here even
    // though it trips the "no setState in effect" lint rule; that rule's
    // rationale (avoid cascading renders) doesn't apply to a one-time,
    // first-paint-only flag like this.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
