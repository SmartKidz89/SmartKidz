import Link from "next/link";
import { Card } from "./Card";
import { Button } from "./Button";

export function EmptyState({
  title = "Nothing here yet",
  description = "When content is available, it will show up here.",
  primaryAction,
  secondaryAction,
}) {
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {primaryAction?.href ? (
            <Link href={primaryAction.href}>
              <Button>{primaryAction.label}</Button>
            </Link>
          ) : null}
          {secondaryAction?.href ? (
            <Link href={secondaryAction.href}>
              <Button variant="ghost">{secondaryAction.label}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
