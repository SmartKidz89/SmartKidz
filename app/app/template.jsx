"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useNavMotion } from "@/components/ui/NavMotionProvider";
import { useFocusMode } from "@/components/ui/FocusModeProvider";

/**
 * Route transition wrapper for the /app segment.
 *
 * Previous version referenced `useNavMotion`, `useFocusMode`, and `variants.pageIn`
 * without importing/defining them, which caused a prerender crash on routes like
 * `/app/admin/import`.
 */
export default function Template({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { direction } = useNavMotion();
  const { focus, toggle: toggleFocus } = useFocusMode();

  const pageVariants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: (d) => ({ opacity: 0, x: d > 0 ? 18 : -18, filter: "blur(8px)" }),
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: (d) => ({ opacity: 0, x: d > 0 ? -12 : 12, filter: "blur(8px)" }),
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-[100dvh]"
      >
        {focus ? (
          <div className="skz-focus-panel">
            <button
              className="skz-glass skz-border-animate skz-shine px-4 py-3 skz-press text-sm"
              onClick={toggleFocus}
            >
              Exit focus mode
            </button>
          </div>
        ) : null}

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
