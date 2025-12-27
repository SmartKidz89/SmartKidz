"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium, kid-friendly page scaffold.
 * Use this across app pages to standardize spacing, typography, and bento layouts.
 */

export function Page({ title, subtitle, badge, actions, children, className }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("skz-page space-y-6", className)}>
      {(title || subtitle || actions) && (
        <Header title={title} subtitle={subtitle} badge={badge} actions={actions} reduce={reduce} />
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Header({ title, subtitle, badge, actions, reduce }) {
  return (
    <div className="skz-header">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {badge && (
            <div className="inline-flex items-center gap-2 skz-chip mb-3">
              <span className="skz-dot" aria-hidden />
              <span className="truncate">{badge}</span>
            </div>
          )}

          {title && (
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? {} : { opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900"
            >
              {title}
            </motion.h1>
          )}

          {subtitle && <p className="mt-2 text-slate-700 text-base sm:text-lg max-w-[70ch]">{subtitle}</p>}
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function BentoGrid({ children, className }) {
  return <div className={cn("grid grid-cols-12 gap-4", className)}>{children}</div>;
}

export function BentoCard({ children, className, as: As = "div" }) {
  return (
    <As className={cn("skz-surface skz-card p-5 sm:p-6 col-span-12", className)}>
      {children}
    </As>
  );
}

export function Kpi({ label, value, hint, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="skz-icon-bubble">{icon}</div>
      <div>
        <div className="text-sm text-slate-600 font-semibold">{label}</div>
        <div className="text-2xl font-black tracking-tight text-slate-900">{value}</div>
        {hint && <div className="text-sm text-slate-600 mt-1">{hint}</div>}
      </div>
    </div>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-slate-200/70 my-4" />;
}
