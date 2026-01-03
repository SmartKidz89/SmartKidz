"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cx } from "@/components/admin/adminUi";

/**
 * Lightweight, consistent status message surface for admin pages.
 */
export default function AdminNotice({
  tone = "info", // info | success | warning | danger
  title,
  children,
  className,
}) {
  const cfg = useMemo(() => {
    switch (tone) {
      case "success":
        return {
          wrap: "border-emerald-200 bg-emerald-50 text-emerald-900",
          icon: CheckCircle2,
          iconCls: "text-emerald-700",
        };
      case "warning":
        return {
          wrap: "border-amber-200 bg-amber-50 text-amber-900",
          icon: AlertTriangle,
          iconCls: "text-amber-700",
        };
      case "danger":
        return {
          wrap: "border-rose-200 bg-rose-50 text-rose-900",
          icon: AlertTriangle,
          iconCls: "text-rose-700",
        };
      default:
        return {
          wrap: "border-slate-200 bg-slate-50 text-slate-900",
          icon: Info,
          iconCls: "text-slate-700",
        };
    }
  }, [tone]);

  const Icon = cfg.icon;

  return (
    <div
      className={cx("rounded-2xl border px-4 py-3 text-sm", cfg.wrap, className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={cx("mt-0.5 h-5 w-5", cfg.iconCls)} aria-hidden="true" />
        <div className="min-w-0">
          {title ? <div className="font-semibold">{title}</div> : null}
          <div className={title ? "mt-0.5" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}
