"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function AmbientCanvas({ variant = "home" }) {
  const ref = useRef(null);
  const { theme } = useTheme(); // Hook into theme system

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, dpr = 1;

    // Use theme colors if available, otherwise default vibrant palette
    const themeColors = theme?.colors ? { a: theme.colors.a, b: theme.colors.b } : { a: [0, 191, 165], b: [255, 111, 97] };
    const defaultColors = { a: [0, 191, 165], b: [255, 111, 97] };

    const palette = {
      home:   themeColors,
      worlds: { a: [0, 191, 165], b: [56, 189, 248] },
      lesson: { a: [255, 111, 97], b: [0, 191, 165] },
      rewards:{ a: [250, 204, 21], b: [255, 111, 97] },
      parent: { a: [15, 23, 42],  b: [0, 191, 165] },
    }[variant] || defaultColors;

    const rand = (min, max) => min + Math.random() * (max - min);
    const mix = (c1, c2, t) => [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t),
    ];

    const particles = [];
    const countFor = () => {
      const base = Math.min(90, Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / 28000)));
      return variant === "parent" ? Math.floor(base * 0.65) : base;
    };

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles.length = 0;
      const n = countFor();
      for (let i = 0; i < n; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(1.2, 3.6),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.06, 0.18),
          t: Math.random(),
          o: rand(0.06, 0.16),
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.10;
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 80, w * 0.5, h * 0.35, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(255,255,255,0.12)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.t += 0.004;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const c = mix(palette.a, palette.b, (Math.sin(p.t) + 1) / 2);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${p.o})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [variant, theme]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="skz-ambient-canvas pointer-events-none fixed inset-0 -z-10"
    />
  );
}