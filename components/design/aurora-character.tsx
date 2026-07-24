"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Floating minimal aurora-glow character head — adapted from
 * superdesign.dev's "Interactive virtual character" (real prompt pulled
 * during research, see CLAUDE.md). That entry is an image-generation
 * prompt, not a code component, so this is an original CSS/SVG
 * implementation built to match its description: a diffused glowing
 * aurora sphere (cyan/violet/blue) with foggy edges, a calm geometric
 * white-line face (high curved eyebrows, dot eyes, "L" nose), floating
 * gently. The only deliberate color accent on an otherwise monochrome
 * site — used once, in the hero, as a focal point.
 *
 * The "Interactive" in the source name is the pointer-tracking below: the
 * eyes and a slight head tilt follow the cursor anywhere on the page,
 * clamped to a small range so it reads as "alive," not distracting.
 */
export function AuroraCharacter({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pupilX = useSpring(rawX, { stiffness: 220, damping: 20 });
  const pupilY = useSpring(rawY, { stiffness: 220, damping: 20 });
  const tiltRotateY = useSpring(useTransform(rawX, (v) => v * 1.8), { stiffness: 90, damping: 18 });
  const tiltRotateX = useSpring(useTransform(rawY, (v) => v * -1.8), { stiffness: 90, damping: 18 });

  useEffect(() => {
    function clamp(v: number, max: number) {
      return Math.max(-max, Math.min(max, v));
    }
    function handlePointerMove(e: PointerEvent) {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      rawX.set(clamp(dx / 18, 4));
      rawY.set(clamp(dy / 18, 3.5));
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={wrapRef}
      className={className}
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="relative aspect-square w-full [transform-style:preserve-3d]"
        style={{ rotateX: tiltRotateX, rotateY: tiltRotateY, perspective: 800 }}
      >
        {/* Aurora glow layers — blurred, overlapping radial gradients */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-80 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #67e8f9 0%, transparent 55%), radial-gradient(circle at 65% 40%, #a78bfa 0%, transparent 55%), radial-gradient(circle at 50% 70%, #60a5fa 0%, transparent 60%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full opacity-70 blur-2xl"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "conic-gradient(from 0deg, #67e8f9, #a78bfa, #60a5fa, #67e8f9)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-[18%] rounded-full bg-white/40 opacity-60 blur-2xl"
        />

        {/* Face — clean geometric white vector lines with a soft glow */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.85))" }}
          role="img"
          aria-label="Calm, minimal illustrated character that follows your cursor"
        >
          {/* eyebrows: high curved arcs */}
          <path
            d="M 62 88 Q 76 66 92 84"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 108 84 Q 124 66 138 88"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* eyes: dots that track the cursor within a small radius */}
          <motion.circle cx="78" cy="104" r="4.5" fill="white" style={{ x: pupilX, y: pupilY }} />
          <motion.circle cx="122" cy="104" r="4.5" fill="white" style={{ x: pupilX, y: pupilY }} />
          {/* nose: "L" shaped line */}
          <path
            d="M 100 108 L 100 128 L 112 128"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
