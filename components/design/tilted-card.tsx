"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * 3D parallax tilt-on-hover card, adapted from superdesign.dev's "Tilted
 * Card" (real production source pulled during research — see CLAUDE.md).
 * Trimmed from the image-showcase original to a generic content card for
 * LeadDesk's feature grid.
 */
export function TiltedCard({
  children,
  className,
  rotateAmplitude = 8,
  scaleOnHover = 1.03,
}: {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { damping: 30, stiffness: 100, mass: 2 });
  const rotateY = useSpring(useMotionValue(0), { damping: 30, stiffness: 100, mass: 2 });
  const scale = useSpring(1, { damping: 30, stiffness: 100, mass: 2 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function handleLeave() {
    setHovered(false);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("[perspective:800px]", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setHovered(true);
        scale.set(scaleOnHover);
      }}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="h-full w-full rounded-3xl border border-border bg-card [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, scale }}
        animate={{ boxShadow: hovered ? "0 24px 48px -12px rgb(0 0 0 / 0.18)" : "0 1px 2px rgb(0 0 0 / 0.04)" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
