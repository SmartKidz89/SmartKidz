"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useNavMotion } from "@/components/ui/NavMotionProvider";
import { useFocusMode } from "@/components/ui/FocusModeProvider";

export default function Template({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { direction } = useNavMotion();
  const { focus, toggle: toggleFocus } = useFocusMode();

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        // "Spatial" navigation: zoom in slightly on enter, fade out on exit
        initial: { opacity: 0, scale: 0.96, y: 8, filter: "blur(4px)" },
        animate: { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 380, damping: 25, mass: 0.8 } 
        },
        exit: { 
          opacity: 0, 
          scale: 1.02, 
          filter: "blur(2px)",
          transition: { duration: 0.2, ease: "easeOut" } 
        },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
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