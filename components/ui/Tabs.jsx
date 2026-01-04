"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn("flex gap-1 p-1 bg-slate-100/80 rounded-xl", className)}>
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors z-10",
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
               {t.icon && <t.icon className="w-4 h-4" />}
               {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}