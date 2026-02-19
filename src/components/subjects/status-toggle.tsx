"use client";

import { motion } from "framer-motion";

export function StatusToggle({
  status,
  onToggle,
}: {
  status: number;
  onToggle: () => void;
}) {
  const states = [
    { icon: "?", label: "Not Started" },
    { icon: "??", label: "In Progress" },
    { icon: "?", label: "Mastered" },
  ];

  const current = states[status] || states[0];

  return (
    <button
      onClick={onToggle}
      className="group relative flex items-center gap-1.5"
      title={current.label}
    >
      <motion.span
        key={status}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-lg"
      >
        {current.icon}
      </motion.span>
    </button>
  );
}
