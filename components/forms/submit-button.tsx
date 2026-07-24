"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Letter-by-letter text swap between idle/loading labels ("Send message" ->
 * "Sending"), concept adapted from superdesign.dev's "Button loading state"
 * (real prompt).
 */
export function SubmitButton({
  loading,
  idleLabel,
  loadingLabel,
  className,
  disabled,
}: {
  loading: boolean;
  idleLabel: string;
  loadingLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const label = loading ? loadingLabel : idleLabel;
  const characters = Array.from(label);

  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      aria-label={label}
      className={cn("relative overflow-hidden rounded-full", className)}
    >
      {/* Per-character spans are decorative only — without aria-hidden,
          assistive tech concatenates each span with an implicit space,
          announcing "S e n d m e s s a g e" letter by letter. aria-label
          above carries the real accessible name. */}
      <AnimatePresence mode="wait">
        <motion.span key={label} aria-hidden="true" className="inline-flex" initial="hidden" animate="visible">
          {characters.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.015 }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
