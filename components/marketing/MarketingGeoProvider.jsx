"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GEO_CONFIG, getGeoConfig } from "@/lib/marketing/geoConfig";

const MarketingGeoContext = createContext(GEO_CONFIG.INT);

export function MarketingGeoProvider({ children }) {
  const [geo, setGeo] = useState(GEO_CONFIG.INT);

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
          const code = data.country || "INT";
          const config = getGeoConfig(code);
          setGeo(config);
          localStorage.setItem("skz_geo_code", code);
        })
        .catch(() => {
          // Fallback to INT on error
          setGeo(GEO_CONFIG.INT);
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
  return useContext(MarketingGeoContext);
}