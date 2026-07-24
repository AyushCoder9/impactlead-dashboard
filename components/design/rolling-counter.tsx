"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Odometer-style rolling digit counter. Adapted from superdesign.dev's
 * "Counter" (RollingCounter) UI component — real production source pulled
 * during research, re-implemented here trimmed to what LeadDesk's stat
 * tiles need.
 */
function Digit({ mv, height }: { mv: MotionValue<number>; height: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums" style={{ height, width: "1ch" }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={mv} number={i} height={height} />
      ))}
    </span>
  );
}

function Number({
  mv,
  number,
  height,
}: {
  mv: MotionValue<number>;
  number: number;
  height: number;
}) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) memo -= 10 * height;
    return memo;
  });
  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {number}
    </motion.span>
  );
}

export function RollingCounter({
  value,
  fontSize = 40,
  className,
}: {
  value: number;
  fontSize?: number;
  className?: string;
}) {
  const height = fontSize * 1.1;
  const digitsStr = String(Math.max(0, Math.round(value)));
  const places = digitsStr.split("").map((_, i) => 10 ** (digitsStr.length - i - 1));

  return (
    <span className={className} style={{ fontSize, display: "inline-flex", lineHeight: 1 }}>
      {places.map((place, i) => (
        <AnimatedDigit key={`${place}-${i}`} place={place} value={value} height={height} />
      ))}
    </span>
  );
}

function AnimatedDigit({
  place,
  value,
  height,
}: {
  place: number;
  value: number;
  height: number;
}) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, {
    damping: 24,
    stiffness: 120,
    mass: 1,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return <Digit mv={animatedValue} height={height} />;
}
