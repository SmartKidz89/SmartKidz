"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CandyCard({ children, color = "white", className, onClick, ...props }) {
  const tones = {
    white: "from-white/80 to-white/60",
    blue: "from-sky-50/80 to-white/60",
    yellow: "from-amber-50/80 to-white/60",
    green: "from-emerald-50/80 to-white/60",
    purple: "from-violet-50/80 to-white/60",
    pink: "from-pink-50/80 to-white/60",
  };

  const bg = tones[color] || tones.white;

  return (
    <motion.div
      whileHover={{ y: -6, rotate: -0.2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "skz-surface skz-card p-6",
        "cursor-pointer select-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className={cn("absolute inset-0 -z-10 opacity-70 bg-gradient-to-b", bg)} />
      {children}
    </motion.div>
  );
}
