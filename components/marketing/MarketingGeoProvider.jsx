"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GEO_CONFIG, getGeoConfig } from "@/lib/marketing/geoConfig";

// Default to AU as it's the only supported region now
const MarketingGeoContext = createContext(GEO_CONFIG.AU);

export function MarketingGeoProvider({ children }) {
  const [geo, setGeo] = useState(GEO_CONFIG.AU);

  useEffect(() => {
    // 1. Check if we already detected/saved
    const saved = typeof window !== "undefined" ? localStorage.getItem("skz_geo_code") : null;
    if (saved && GEO_CONFIG[saved]) {
      setGeo(GEO_CONFIG[saved]);
    } else {
      // 2. Fetch from our API
      fetch("/api/geo")
        .then((res) => res.json())
        .then((data) => {
          const code = data.country || "AU";
          // Always fallback to AU if code not found in config
          const config = GEO_CONFIG[code] || GEO_CONFIG.AU;
          setGeo(config);
          localStorage.setItem("skz_geo_code", code);
        })
        .catch(() => {
          // Fallback to AU on error
          setGeo(GEO_CONFIG.AU);
        });
    }
  }, []);

  return (
    <MarketingGeoContext.Provider value={geo}>
      {children}
    </MarketingGeoContext.Provider>
  );
}

export function useMarketingGeo() {
  const context = useContext(MarketingGeoContext);
  // Safety check if context is somehow null
  return context || GEO_CONFIG.AU;
}