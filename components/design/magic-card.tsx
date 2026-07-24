"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Spotlight + border-glow + tilt card, adapted from superdesign.dev's
 * "Bento" (MagicBento — real production source pulled during research, see
 * CLAUDE.md). Original is dark-themed with purple particle effects; reskinned
 * to the flat monochrome palette and particles dropped (too loud for the
 * Swiss/brutalist restraint), keeping spotlight/glow/tilt which read as
 * "premium" without breaking the aesthetic.
 */
export function MagicCard({
  children,
  className,
  spotlightRadius = 260,
}: {
  children: ReactNode;
  className?: string;
  spotlightRadius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spotlight-radius", `${spotlightRadius}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (((e.clientY - rect.top) - centerY) / centerY) * -4;
    const rotateY = (((e.clientX - rect.left) - centerX) / centerX) * 4;
    el.style.setProperty("--rotate-x", `${rotateX}deg`);
    el.style.setProperty("--rotate-y", `${rotateY}deg`);
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rotate-x", "0deg");
    el.style.setProperty("--rotate-y", "0deg");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "magic-card group relative overflow-hidden rounded-3xl border border-border bg-card transition-transform duration-200 ease-out [transform-style:preserve-3d]",
        className,
      )}
      style={{
        transform: "perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spotlight-radius, 260px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in oklch, var(--foreground), transparent 92%), transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: 1,
          background:
            "radial-gradient(var(--spotlight-radius, 260px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in oklch, var(--foreground), transparent 40%), transparent 60%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
