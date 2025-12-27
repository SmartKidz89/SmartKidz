"use client";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: {
    parent:
      "text-white bg-gradient-to-b from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-[var(--shadow-e3)]",
    kid:
      "text-white bg-gradient-to-b from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 shadow-[var(--shadow-e3)]",
  },
  secondary: {
    parent:
      "bg-white/80 text-slate-900 border border-white/70 hover:bg-white shadow-[var(--shadow-e2)]",
    kid:
      "bg-white/80 text-slate-900 border-2 border-white/70 hover:bg-white shadow-[var(--shadow-e2)]",
  },
  ghost: {
    parent: "bg-transparent text-slate-900 hover:bg-white/60",
    kid: "bg-transparent text-slate-900 hover:bg-white/60",
  },
  danger: {
    parent:
      "text-white bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[var(--shadow-e3)]",
    kid:
      "text-white bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-[var(--shadow-e3)]",
  },
};

const SIZES = {
  sm: "h-9 px-3 text-sm rounded-2xl",
  md: "h-11 px-4 text-sm rounded-2xl",
  lg: "h-12 px-5 text-base rounded-[1.35rem]",
};

export function Button({ variant = "primary", size = "md", mode = "kid", className, ...props }) {
  const v = (VARIANTS[variant] || VARIANTS.primary)[mode] || VARIANTS.primary.kid;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-extrabold tracking-tight transition",
        "focus:outline-none focus:ring-4 focus:ring-sky-400/25",
        "disabled:opacity-50 disabled:pointer-events-none",
        "skz-pressable",
        s,
        v,
        "after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(240px_120px_at_20%_0%,rgba(255,255,255,.28),transparent_60%)] after:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}
