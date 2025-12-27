"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export function HomeCloud({ to = "/app", label = "Home" }) {
  const router = useRouter();
  return (
    <motion.button
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold shadow-[var(--shadow-e1)] backdrop-blur"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(to)}
      aria-label={label}
    >
      <Home size={16} />
      <span>{label}</span>
    </motion.button>
  );
}
