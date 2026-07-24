"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/design/theme-toggle";

/**
 * "Shrinking Sticky Header" — shrinks height ~20% and transitions to a
 * blurred glassmorphism background after 100px of scroll. Researched from
 * superdesign.dev's UI Component library (real prompt — see CLAUDE.md).
 */
export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-6 transition-[height,background-color,backdrop-filter,border-color] duration-300",
        scrolled
          ? "h-14 border-b border-border/60 bg-background/70 backdrop-blur-md"
          : "h-[4.5rem] border-b border-transparent bg-transparent",
      )}
    >
      <Link href="/" className="font-heading text-lg font-bold tracking-tight">
        LeadDesk
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
        <Link href="/#how-it-works" className="hover:opacity-70">
          How it works
        </Link>
        <Link href="/demo" className="hover:opacity-70">
          Live demo
        </Link>
        <Link href="/#capture" className="hover:opacity-70">
          Get started
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild size="sm" className="rounded-full">
          <Link href="/admin/login">Admin login</Link>
        </Button>
      </div>
    </motion.header>
  );
}
