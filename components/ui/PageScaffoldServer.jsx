/**
 * Server-friendly page scaffold (no framer-motion).
 * Use this for server components/pages to avoid forcing the entire route into a client boundary.
 */
import React from "react";

export function Page({ title, subtitle, actions, children, className = "" }) {
  return (
    <div className={"container-pad py-8 md:py-10 " + className}>
      <header className="mb-6 md:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="skz-gradient-text">{title}</span>
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm md:text-base text-white/70 max-w-2xl">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </header>
      <div className="skz-enter">
        {children}
      </div>
    </div>
  );
}

export function BentoGrid({ children, className = "" }) {
  return (
    <div
      className={
        "grid grid-cols-12 gap-4 md:gap-5 auto-rows-min " + className
      }
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  subtitle,
  icon,
  children,
  className = "",
  colSpan = "col-span-12",
}) {
  return (
    <section className={"skz-surface skz-card p-4 md:p-5 " + colSpan + " " + className}>
      {(title || subtitle || icon) ? (
        <div className="flex items-start gap-3 mb-3">
          {icon ? <div className="skz-icon-bubble">{icon}</div> : null}
          <div className="min-w-0">
            {title ? <h2 className="text-base md:text-lg font-bold">{title}</h2> : null}
            {subtitle ? <p className="text-xs md:text-sm text-white/70">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Divider({ className = "" }) {
  return <div className={"h-px bg-white/10 my-4 " + className} />;
}

export function Kpi({ label, value, hint, className = "" }) {
  return (
    <div className={"skz-surface skz-card p-4 " + className}>
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/55">{hint}</div> : null}
    </div>
  );
}
