"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function FAQAccordion({ items = [] }) {
  const data = useMemo(() => items.filter(Boolean), [items]);
  const [open, setOpen] = useState(data[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {data.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id} className="sk-card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : it.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="font-semibold text-slate-900">{it.q}</div>
              <ChevronDown className={clsx("h-5 w-5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <div className="px-5 pb-5 text-slate-600 leading-relaxed">
                    {it.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}