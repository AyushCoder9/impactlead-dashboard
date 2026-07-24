"use client";

import { motion } from "motion/react";
import { AuroraCharacter } from "@/components/design/aurora-character";

export function HeroCharacter() {
  return (
    <div className="relative mx-auto hidden w-full max-w-sm lg:block">
      <AuroraCharacter className="w-full" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        Lea never sleeps on your pipeline.
      </motion.p>
    </div>
  );
}
