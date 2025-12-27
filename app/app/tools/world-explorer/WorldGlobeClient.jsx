"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Map as MapIcon, Loader2 } from "lucide-react";

// Robust Fallback Data
const FALLBACK_COUNTRIES = [
  { name: { common: "Australia" }, latlng: [-25, 133], cca2: "AU", region: "Oceania", flag: "🇦🇺" },
  { name: { common: "United States" }, latlng: [38, -97], cca2: "US", region: "Americas", flag: "🇺🇸" },
  { name: { common: "United Kingdom" }, latlng: [55, -3], cca2: "GB", region: "Europe", flag: "🇬🇧" },
  { name: { common: "France" }, latlng: [46, 2], cca2: "FR", region: "Europe", flag: "🇫🇷" },
  { name: { common: "Japan" }, latlng: [36, 138], cca2: "JP", region: "Asia", flag: "🇯🇵" },
  { name: { common: "Brazil" }, latlng: [-10, -55], cca2: "BR", region: "Americas", flag: "🇧🇷" },
  { name: { common: "Egypt" }, latlng: [26, 30], cca2: "EG", region: "Africa", flag: "🇪🇬" },
  { name: { common: "India" }, latlng: [20, 77], cca2: "IN", region: "Asia", flag: "🇮🇳" },
  { name: { common: "China" }, latlng: [35, 105], cca2: "CN", region: "Asia", flag: "🇨🇳" },
  { name: { common: "Canada" }, latlng: [60, -95], cca2: "CA", region: "Americas", flag: "🇨🇦" },
];

// Simple Mercator-ish projection for display
function project(lat, lng) {
  const x = (lng + 180) * (100 / 360);
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (100 / 2) - (100 * mercN / (2 * Math.PI));
  // Clamp y to avoid poles stretching infinitely
  const clampedY = Math.max(5, Math.min(95, y));
  return { x, y: clampedY };
}

export default function WorldMapClient({ onSelect }) {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,cca3,latlng,region,subregion,capital,flag", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API error");
        
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      } catch (e) {
        console.warn("World Explorer: Using fallback data due to fetch error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Filter and project points
  const points = useMemo(() => {
    return countries
      .filter(c => c.latlng && c.latlng.length === 2)
      .map(c => {
        const p = project(c.latlng[0], c.latlng[1]);
        return { ...c, x: p.x, y: p.y };
      });
  }, [countries]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", 
          backgroundSize: "40px 40px" 
        }} 
      />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-500">
           <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
           <div className="text-white font-bold tracking-widest text-xs uppercase">Loading Map Data...</div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full max-w-5xl aspect-[2/1] bg-slate-800/30 rounded-3xl border border-white/5 shadow-2xl p-4 overflow-hidden">
        {/* World Outline Placeholder (CSS Shapes could go here, for now using dots) */}
        <div className="absolute inset-0 flex items-center justify-center text-slate-700 opacity-20 font-black text-9xl select-none pointer-events-none tracking-tighter">
           WORLD
        </div>

        {points.map((p) => {
          const isHovered = hovered === p.name.common;
          return (
            <motion.button
              key={p.name.common}
              className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isHovered ? 2.5 : 1, 
                opacity: 1,
                backgroundColor: isHovered ? "#fbbf24" : "rgba(255,255,255,0.6)",
                boxShadow: isHovered ? "0 0 15px #fbbf24" : "none",
                zIndex: isHovered ? 50 : 10
              }}
              transition={{ duration: 0.5, delay: Math.random() * 1 }}
              onMouseEnter={() => setHovered(p.name.common)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(p)}
            />
          );
        })}

        {/* Hover Label */}
        {hovered && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
            <div className="text-sm font-black text-slate-900">{hovered}</div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
         <MapIcon className="w-4 h-4" /> Interactive Map
      </div>

    </div>
  );
}