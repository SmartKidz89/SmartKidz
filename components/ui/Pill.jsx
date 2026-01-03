import { cn } from "@/lib/utils";
const VARIANTS={neutral:"bg-slate-100 text-slate-800",primary:"bg-sky-100 text-sky-800",success:"bg-emerald-100 text-emerald-800",warning:"bg-amber-100 text-amber-900",danger:"bg-rose-100 text-rose-800"};
export function Pill({ children, variant="neutral", className="", ...props }) {
 const v=VARIANTS[variant]||VARIANTS.neutral;
 return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",v,className)} {...props}>{children}</span>;
}
