"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AmbientCanvas from "@/components/ui/AmbientCanvas";

/**
 * Fixed, animated backdrop that changes per route to create
 * “each page feels like a new world” energy without breaking layout.
 */
export default function RouteBackdrop() {
  const pathname = usePathname();

  let variant = "home";
  if (pathname?.startsWith("/app/worlds") || pathname?.startsWith("/app/world")) variant = "worlds";
  if (pathname?.startsWith("/app/lesson")) variant = "lesson";
  if (pathname?.startsWith("/app/rewards") || pathname?.startsWith("/app/avatar") || pathname?.startsWith("/app/shop")) variant = "rewards";
  if (pathname?.startsWith("/app/parent")) variant = "parent";useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.skzVariant = variant;
    }
  }, [variant]);


  return (
    <div className="pointer-events-none">
      <div className="skz-backdrop" data-variant={variant} />
      <AmbientCanvas variant={variant} />
      <div className="skz-noise" aria-hidden="true" />
    </div>
  );
}
