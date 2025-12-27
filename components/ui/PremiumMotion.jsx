"use client";
import { motion } from "framer-motion";
import { variants } from "@/lib/motion";

export function PageMotion({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={variants.pageIn.initial}
      animate={variants.pageIn.animate}
      exit={variants.pageIn.exit}
    >
      {children}
    </motion.div>
  );
}

export function CardMotion({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={variants.cardIn.initial}
      animate={variants.cardIn.animate}
    >
      {children}
    </motion.div>
  );
}
