"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

