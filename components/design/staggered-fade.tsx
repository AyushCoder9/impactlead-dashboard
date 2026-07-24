"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * "Character Staggered Fade" — each character starts at 50% opacity, 5px
 * blur, and sharpens into focus with a 0.02s stagger. Researched from
 * superdesign.dev's Animation library (real prompt, not guessed — see
 * CLAUDE.md).
 */
export function StaggeredFade({
  children,
  as: Tag = "p",
  className,
  delay = 0,
}: {
  children: string;
  as?: "p" | "span" | "h2" | "h3";
  className?: string;
  delay?: number;
}) {
  const characters = Array.from(children);

  return (
    <Tag className={cn("inline-block", className)} aria-label={children}>
      {/* Per-character spans are decorative — aria-hidden here plus
          aria-label above stops assistive tech from announcing this letter
          by letter (a real bug caught by the Playwright e2e test: a button
          using this same per-character pattern computed an accessible name
          of "S e n d m e s s a g e" instead of "Send message"). See
          CLAUDE.md. */}
      <span aria-hidden="true">
        {characters.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0.5, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: delay + i * 0.02 }}
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </span>
    </Tag>
  );
}
