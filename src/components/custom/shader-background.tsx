"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const blobs = [
  {
    color: "from-indigo-500/28 via-violet-500/18 to-transparent",
    size: "h-[30rem] w-[30rem]",
    start: "-left-24 -top-28",
    animate: { x: [0, 90, -30, 0], y: [0, -60, 30, 0], rotate: [0, 25, -20, 0] },
  },
  {
    color: "from-cyan-400/22 via-blue-500/15 to-transparent",
    size: "h-[28rem] w-[28rem]",
    start: "right-[-8rem] top-[18%]",
    animate: { x: [0, -100, 35, 0], y: [0, 70, -40, 0], rotate: [0, -40, 20, 0] },
  },
  {
    color: "from-fuchsia-500/20 via-purple-500/14 to-transparent",
    size: "h-[26rem] w-[26rem]",
    start: "left-[38%] bottom-[-8rem]",
    animate: { x: [0, 80, -50, 0], y: [0, -55, 45, 0], rotate: [0, 35, -25, 0] },
  },
];

export function ShaderBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.75),rgba(2,6,23,0.98))]" />

      {blobs.map((blob, idx) => (
        <motion.div
          key={idx}
          className={cn(
            "absolute rounded-full bg-gradient-to-br blur-3xl mix-blend-screen",
            blob.size,
            blob.color,
            blob.start
          )}
          animate={blob.animate}
          transition={{
            duration: 20 + idx * 6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>
  );
}

