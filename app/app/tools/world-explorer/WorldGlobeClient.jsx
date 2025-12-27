"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, Loader2, Plus, Minus, RotateCcw, Compass } from "lucide-react";

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

// Equirectangular projection (Plate Carrée) - Fits 2:1 aspect ratio perfectly
function project(lat, lng) {
  // Longitude: -180 to 180 -> 0 to 100%
  const x = ((lng + 180) / 360) * 100;
  // Latitude: 90 to -90 -> 0 to 100%
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

// Map Source
const MAP_SVG_URL = "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')";

export default function WorldGlobeClient({ onSelect }) {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

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

  const points = useMemo(() => {
    return countries
      .filter(c => c.latlng && c.latlng.length === 2)
      .map(c => {
        const p = project(c.latlng[0], c.latlng[1]);
        return { ...c, x: p.x, y: p.y };
      });
  }, [countries]);

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 6);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleZoom = (direction) => {
    const newScale = Math.min(Math.max(1, scale + direction * 0.5), 6);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const startDrag = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault(); 
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Simple boundary clamping could go here, but free pan feels nicer for kids
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-[#0b1121] overflow-hidden flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] cursor-move select-none touch-none border border-slate-700/50 shadow-2xl">
      
      {/* 1. Deep Space Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0b1121] to-black" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500">
           <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
           <div className="text-sky-200 font-bold tracking-widest text-xs uppercase">Initializing Map...</div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full touch-none flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={stopDrag}
      >
        <motion.div
          className="relative w-[800px] h-[400px]" // Fixed 2:1 aspect ratio base
          style={{ originX: 0.5, originY: 0.5 }}
          animate={{ x: position.x, y: position.y, scale }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
        >
           {/* 
             2. Holographic Map Layer 
             Using mask-image to clip a vibrant gradient to the shape of the world.
           */}
           <div className="absolute inset-0 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
             <div 
               className="absolute inset-0 w-full h-full"
               style={{ 
                 background: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                 maskImage: MAP_SVG_URL,
                 WebkitMaskImage: MAP_SVG_URL,
                 maskSize: "100% 100%",
                 WebkitMaskSize: "100% 100%",
                 opacity: 0.85
               }}
             />
             {/* Add a second layer for depth/glow */}
             <div 
               className="absolute inset-0 w-full h-full mix-blend-overlay"
               style={{ 
                 background: "linear-gradient(to bottom, transparent, #fff 40%, transparent)",
                 maskImage: MAP_SVG_URL,
                 WebkitMaskImage: MAP_SVG_URL,
                 maskSize: "100% 100%",
                 WebkitMaskSize: "100% 100%",
                 opacity: 0.3
               }}
             />
           </div>

           {/* 3. Interactive Markers Layer */}
           <div className="absolute inset-0 z-20">
             {points.map((p) => {
                const isHovered = hovered === p.name.common;
                // Scale dots inversely to map scale so they don't get huge
                const size = Math.max(0.6, 1.4 / scale); 

                return (
                  <div
                    key={p.name.common}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                     {/* Larger Hit Area */}
                     <button 
                       onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                       onMouseEnter={() => setHovered(p.name.common)}
                       onMouseLeave={() => setHovered(null)}
                       className="w-10 h-10 -m-5 rounded-full cursor-pointer absolute z-30"
                       aria-label={p.name.common}
                     />
                     
                     {/* The Dot Visual */}
                     <motion.div
                       animate={{ 
                         scale: isHovered ? 2.5 : 1, 
                         backgroundColor: isHovered ? "#fbbf24" : "rgba(255,255,255,0.9)",
                         boxShadow: isHovered ? "0 0 20px 5px rgba(251, 191, 36, 0.8)" : "0 0 4px rgba(255,255,255,0.5)",
                       }}
                       className="w-2 h-2 rounded-full pointer-events-none"
                       style={{ transform: `scale(${size})` }} 
                     />
                  </div>
                );
             })}
           </div>
        </motion.div>
      </div>

      {/* 4. UI Overlays */}
      <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 flex flex-col gap-2 z-40">
        <button onClick={() => handleZoom(1)} className="p-3 rounded-xl bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700 shadow-lg transition-all active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => handleZoom(-1)} className="p-3 rounded-xl bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700 shadow-lg transition-all active:scale-95">
          <Minus className="w-6 h-6" />
        </button>
        <button onClick={() => { setScale(1); setPosition({x:0,y:0}); }} className="p-3 rounded-xl bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700 shadow-lg transition-all mt-2 active:scale-95">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Hover Label */}
      {hovered && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">
          <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl border border-sky-500/30 whitespace-nowrap flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-sm font-black text-white tracking-wide">{hovered}</span>
          </div>
        </div>
      )}

      {/* Mobile Hint */}
      <div className="absolute bottom-6 left-6 z-40 pointer-events-none md:hidden opacity-60">
        <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
           <MapIcon className="w-3 h-3" /> Pinch / Drag
        </div>
      </div>

    </div>
  );
}