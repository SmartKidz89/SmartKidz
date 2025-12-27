"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { transitions } from "@/lib/motion";
import { playUISound, haptic } from "@/components/ui/sound";

const MomentsContext = createContext({
  show: () => {},
  markSeen: () => {},
});

function key(childId, momentId) {
  return `skz_moment_${childId || "anon"}_${momentId}`;
}

export function MomentsProvider({ children }) {
  const [active, setActive] = useState(null); // { id, title, body, cta, onCta }
  const value = useMemo(() => ({
    show: (m) => setActive(m),
    markSeen: (childId, momentId) => {
      try { localStorage.setItem(key(childId, momentId), "1"); } catch {}
    }
  }), []);

  return (
    <MomentsContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: transitions.page }}
            exit={{ opacity: 0, transition: transitions.page }}
          >
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setActive(null)} />
            <motion.div
              className="relative w-full max-w-xl skz-glass p-6 md:p-8 skz-border-animate"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: transitions.page }}
              exit={{ opacity: 0, y: 10, scale: 0.98, transition: transitions.page }}
            >
              <div className="absolute -top-14 -right-16 w-72 h-72 rounded-full bg-indigo-400/12 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl" />
              <div className="relative">
                <div className="text-xs text-slate-500">A quick moment</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">{active.title}</div>
                <div className="mt-3 text-slate-700 text-sm md:text-base leading-relaxed">{active.body}</div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button className="skz-chip px-4 py-3 skz-press" onClick={() => setActive(null)}>
                    Close
                  </button>
                  {active.cta ? (
                    <button
                      className="skz-glass skz-border-animate skz-shine px-5 py-3 skz-press"
                      onClick={() => {
                        try { playUISound("tap"); haptic("light"); } catch {}
                        setActive(null);
                        active.onCta?.();
                      }}
                    >
                      {active.cta}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MomentsContext.Provider>
  );
}

export function useMoments() {
  return useContext(MomentsContext);
}

export function hasSeenMoment(childId, momentId) {
  try { return localStorage.getItem(key(childId, momentId)) === "1"; } catch { return false; }
}
