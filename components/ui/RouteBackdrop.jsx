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
  
  // Kid zone is everything else in /app
  const isKidZone = !isParent && !isAuth && pathname?.startsWith("/app");

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

  // If in Kid Zone, ALWAYS override the background with the selected theme
  // This ensures the "Space" or "Unicorn" theme persists everywhere.
  const style = isKidZone && theme?.bgGradient 
    ? { background: theme.bgGradient } 
    : {};

  // For the AmbientCanvas particles, we can also pass the theme colors 
  // if we want the particles to match the theme across all kid pages.
  // The AmbientCanvas component handles this logic internally if variant="home",
  // but we might want to force it to use theme colors for all kid routes.
  // For now, let's keep the variant logic in AmbientCanvas but just ensure the background matches.

  return (
    <div className="pointer-events-none">
      <div className="skz-backdrop" data-variant={variant} style={style} />
      <AmbientCanvas variant={variant} />
      <div className="skz-noise" aria-hidden="true" />
    </div>
  );
}