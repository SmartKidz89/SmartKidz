import { cn } from "@/lib/utils";
export function PageHeader({ title, subtitle, children, className = "" }) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children ? <div className="pt-2 sm:pt-0">{children}</div> : null}
    </div>
  );
}
