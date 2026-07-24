"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
] as const;

export type LeadStatus = (typeof STATUSES)[number]["value"];

/**
 * Flat monochrome segmented control for the New/Contacted/Closed toggle.
 * Concept carried over from superdesign.dev's "Luminous Switch" (on/off
 * state-transition idea) but NOT its ornate skeuomorphic CSS — that clashes
 * with the flat Swiss/brutalist aesthetic. See CLAUDE.md.
 */
export function StatusSwitch({
  value,
  onChange,
  disabled,
  size = "default",
}: {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={cn(
        "relative inline-flex rounded-full border border-border bg-secondary p-0.5",
        disabled && "opacity-50",
      )}
      role="radiogroup"
      aria-label="Lead status"
    >
      {STATUSES.map((status) => {
        const active = status.value === value;
        return (
          <button
            key={status.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !disabled && onChange(status.value)}
            className={cn(
              "relative z-10 rounded-full font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              active ? "text-primary-foreground" : "text-foreground hover:text-foreground/70",
            )}
          >
            {active && (
              <motion.span
                layoutId={`status-pill-${size}`}
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {status.label}
          </button>
        );
      })}
    </div>
  );
}
