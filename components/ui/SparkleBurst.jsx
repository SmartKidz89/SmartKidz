"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function SparkleBurst({ show }) {
  const reduce = useReducedMotion();
  if (!show) return null;

  const pieces = Array.from({ length: 10 });

  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const dx = Math.cos(angle) * 26;
        const dy = Math.sin(angle) * 26;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/90"
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={
              reduce
                ? { opacity: 0 }
                : { opacity: [0, 1, 0], scale: [0.4, 1.0, 0.6], x: [0, dx], y: [0, dy] }
            }
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.01 }}
          />
        );
      })}
    </div>
  );
}
