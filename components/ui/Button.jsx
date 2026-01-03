"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: {
    parent:
      "text-white bg-slate-900 shadow-[0_4px_14px_0_rgba(15,23,42,0.3)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:bg-slate-800",
    kid:
      "text-white bg-gradient-to-b from-sky-400 to-indigo-500 shadow-[0_4px_0_0_#4f46e5,0_8px_16px_rgba(79,70,229,0.4)] active:shadow-none active:translate-y-[4px]",
  },
  secondary: {
    parent:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    kid:
      "bg-white text-slate-900 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 shadow-sm",
  },
  ghost: {
    parent: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    kid: "bg-transparent text-slate-600 hover:bg-white/60 hover:text-slate-900",
  },
  danger: {
    parent:
      "text-white bg-rose-600 hover:bg-rose-700 shadow-sm",
    kid:
      "text-white bg-rose-500 shadow-[0_4px_0_0_#be123c] active:shadow-none active:translate-y-[4px]",
  },
};

const SIZES = {
  sm: "h-9 px-3 text-xs rounded-xl",
  md: "h-11 px-5 text-sm rounded-2xl",
  lg: "h-14 px-8 text-base rounded-[1.2rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  mode = "kid",
  className,
  children,
  href,
  disabled,
  ...props
}) {
  const v = (VARIANTS[variant] || VARIANTS.primary)[mode] || VARIANTS.primary.kid;
  const s = SIZES[size] || SIZES.md;

  // Is this a "3D" button (kid primary/danger)?
  const is3D = (mode === "kid" && (variant === "primary" || variant === "danger"));

  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 font-extrabold tracking-wide transition-all",
    "focus:outline-none focus:ring-4 focus:ring-sky-400/30",
    "disabled:opacity-50 disabled:pointer-events-none disabled:grayscale",
    s,
    v,
    className
  );

  // Link mode (keeps existing API used throughout the repo: <Button href="/path">)
  if (href && !disabled) {
    return (
      <Link href={href} legacyBehavior>
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={classes}
          {...props}
        >
          {variant === "primary" && (
            <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent opacity-100" />
              <div className="absolute -inset-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_60%)] opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </div>
          )}
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={classes}
      type={props.type || "button"}
      disabled={disabled}
      {...props}
    >
      {/* Gloss shine for primary buttons */}
      {variant === "primary" && (
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent opacity-100" />
          <div className="absolute -inset-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_60%)] opacity-0 hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}