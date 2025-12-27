"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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

// Equirectangular projection
function project(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

// Reliable External Source (Wikimedia Commons - Equirectangular Projection)
// Using a high-contrast simplified map that works well on dark backgrounds.
const RELIABLE_MAP_BG = "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')";

export default function WorldMapClient({ onSelect }) {
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
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
  };

  const handleZoom = (direction) => {
    const newScale = Math.min(Math.max(1, scale + direction * 0.5), 4);
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
    
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] cursor-move select-none touch-none border border-slate-700/50 shadow-2xl">
      
      {/* Decorative Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_100%)] pointer-events-none z-10" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500">
           <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
           <div className="text-sky-200 font-bold tracking-widest text-xs uppercase">Initializing Satellites...</div>
        </div>
      )}

      {/* Map Interactive Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-full touch-none"
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
          className="absolute left-1/2 top-1/2 w-[800px] h-[400px] origin-center"
          animate={{ x: `calc(-50% + ${position.x}px)`, y: `calc(-50% + ${position.y}px)`, scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
           {/* 
              PREMIUM MAP RENDERING 
              We use the SVG as a mask over a vibrant gradient to create a holographic/colorful look.
           */}
           
           {/* 1. Base Glow (Bloom) */}
           <div 
             className="absolute inset-0 blur-lg opacity-40"
             style={{ 
               background: "linear-gradient(120deg, #0ea5e9, #8b5cf6, #ec4899)",
               maskImage: RELIABLE_MAP_BG,
               WebkitMaskImage: RELIABLE_MAP_BG,
               maskSize: "100% 100%",
               WebkitMaskSize: "100% 100%",
               maskPosition: "center",
               WebkitMaskPosition: "center",
               maskRepeat: "no-repeat",
               WebkitMaskRepeat: "no-repeat",
             }}
           />

           {/* 2. Main Map Gradient */}
           <div 
             className="absolute inset-0"
             style={{ 
               background: "linear-gradient(120deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%)",
               maskImage: RELIABLE_MAP_BG,
               WebkitMaskImage: RELIABLE_MAP_BG,
               maskSize: "100% 100%",
               WebkitMaskSize: "100% 100%",
               maskPosition: "center",
               WebkitMaskPosition: "center",
               maskRepeat: "no-repeat",
               WebkitMaskRepeat: "no-repeat",
               opacity: 0.9
             }}
           />

           {/* 3. Subtle Detail Overlay (optional texture) */}
           <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

           {/* Country Points */}
           {points.map((p) => {
              const isHovered = hovered === p.name.common;
              const dotScale = Math.max(0.5, 1.5 / scale); 

              return (
                <div
                  key={p.name.common}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                   {/* Tap target (larger for touch) */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                     onMouseEnter={() => setHovered(p.name.common)}
                     onMouseLeave={() => setHovered(null)}
                     className="w-6 h-6 -m-3 rounded-full cursor-pointer absolute z-30"
                     aria-label={p.name.common}
                   />
                   
                   {/* Visible Dot */}
                   <motion.div
                     initial={false}
                     animate={{ 
                       scale: isHovered ? 2.5 : 1, 
                       backgroundColor: isHovered ? "#fbbf24" : "rgba(255,255,255,0.7)",
                       boxShadow: isHovered ? "0 0 12px 4px rgba(251, 191, 36, 0.6)" : "0 0 4px rgba(255,255,255,0.3)",
                       zIndex: isHovered ? 50 : 10
                     }}
                     className="w-1.5 h-1.5 rounded-full pointer-events-none transition-colors border border-white/20"
                     style={{ transform: `scale(${dotScale})` }} 
                   />
                </div>
              );
           })}
        </motion.div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 flex flex-col gap-2 z-30">
        <button 
          onClick={() => handleZoom(1)} 
          className="p-3 md:p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg group" 
          title="Zoom In"
        >
          <Plus className="w-5 h-5 group-hover:text-sky-400 transition-colors" />
        </button>
        <button 
          onClick={() => handleZoom(-1)} 
          className="p-3 md:p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg group" 
          title="Zoom Out"
        >
          <Minus className="w-5 h-5 group-hover:text-sky-400 transition-colors" />
        </button>
        <button 
          onClick={() => { setScale(1); setPosition({x:0,y:0}); }} 
          className="p-3 md:p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg mt-2 group" 
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5 group-hover:text-sky-400 transition-colors" />
        </button>
      </div>

      {/* Hover Tooltip */}
      {hovered && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">
          <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl border border-white/20 whitespace-nowrap flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-sm font-black text-white tracking-wide">{hovered}</span>
          </div>
        </div>
      )}

      {/* Mobile Hint */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none md:hidden opacity-60">
        <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
           <MapIcon className="w-3 h-3" /> Drag & Zoom
        </div>
      </div>

    </div>
  );
}