import { cn } from "@/lib/utils";

export function Badge({ variant = "neutral", className, ...props }) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700",
    brand: "bg-sky-100 text-sky-800",
    success: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant] ?? variants.neutral,
        className
      )}
      {...props}
    />
  );
}
