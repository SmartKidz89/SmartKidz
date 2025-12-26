"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/motion";

/**
 * ParallaxCard: subtle premium tilt + cursor glow variables.
 * Safe: disables tilt when prefers-reduced-motion.
 */
export default function ParallaxCard({ children, className = "", as: Comp = "div", ...props }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  function onMove(e) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    // for glow gradient
    el.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    el.style.setProperty("--my", `${(y / r.height) * 100}%`);

    // tilt
    const rx = ((y / r.height) - 0.5) * -6; // deg
    const ry = ((x / r.width) - 0.5) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "20%");
  }

  const MotionComp = motion(Comp);

  return (
    <MotionComp
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      transition={transitions.card}
      className={`skz-glow ${className}`}
      {...props}
    >
      {children}
    </MotionComp>
  );
}
