import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "skz-surface skz-card",
        "p-5 sm:p-6",
        className
      )}
      {...props}
    />
  );
}
