"use client";

import { motion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400 shadow-[0_0_24px_rgba(99,102,241,0.6)]",
        className
      )}
    />
  );
}

