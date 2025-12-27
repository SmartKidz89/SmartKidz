"use client";

import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EconomyPill({ className = "" }) {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id || activeChild?.child_id;
  const econ = useEconomy(childId);

  if (!childId) return null;

  return (
    <motion.div data-testid="econ-pill"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(
        "skz-glass skz-border-animate inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black",
        className
      )}
      title="Coins and Level"
    >
      <span className="inline-flex items-center gap-1">
        <span className="text-base">🪙</span>
        <span className="tabular-nums" data-testid="econ-coins">{econ?.coins ?? 0}</span>
      </span>
      <span className="h-4 w-px bg-white/30" />
      <span className="inline-flex items-center gap-1">
        <span className="text-base">⭐</span>
        <span className="tabular-nums">Lv {econ?.level ?? 1}</span>
      </span>
    </motion.div>
  );
}
