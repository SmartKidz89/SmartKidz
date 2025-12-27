"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AmbientCanvas from "@/components/ui/AmbientCanvas";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function RouteBackdrop() {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Determine if we are in the "Parent" or "Auth" zones
  const isParent = pathname?.startsWith("/app/parent");
  const isAuth = pathname?.startsWith("/app/login") || pathname?.startsWith("/app/signup");
  
  let variant = "home";
  if (isParent) variant = "parent";
  else if (pathname?.startsWith("/app/worlds") || pathname?.startsWith("/app/world")) variant = "worlds";
  else if (pathname?.startsWith("/app/lesson")) variant = "lesson";
  else if (pathname?.startsWith("/app/rewards") || pathname?.startsWith("/app/avatar")) variant = "rewards";
  
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.skzVariant = variant;
    }
  }, [variant]);

  return (
    <div className="pointer-events-none">
      <div 
        className="skz-backdrop" 
        data-variant={variant} 
        style={variant === "home" && theme?.bgGradient ? { background: theme.bgGradient } : undefined}
      />
      <AmbientCanvas variant={variant} />
      <div className="skz-noise" aria-hidden="true" />
    </div>
  );
}