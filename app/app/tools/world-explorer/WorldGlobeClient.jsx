"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Map as MapIcon, Loader2, Plus, Minus, RotateCcw } from "lucide-react";

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

// Simplified World Map SVG Path (Mercator-ish)
const WORLD_MAP_SVG = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwMCAxMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiMzMzQxNTUiIGQ9Ik0xNjQ1IDg4NWMtMTEgMi0yNCAxLTMxLTkgNi0yOCAzNS0yOCA0OS0xNSAxMSA5IDEwIDE3LTIgMTktNiA0LTEwIDUtMTYgNXptMTY1LTYxYy0yMC04LTI1LTMyLTgtNDIgMTktMTEgNTktNiA1NCA2LTItNi01LTEzLTgtMTlDOCA3NjIgMCA3ODMgMCA4MDRzOCAzOSAyMyA1OGMzMCAzNSA1NyA0IDY2LTMxIDUtMTkgMi0zNy05LTU0LTQtNS04LTgtMTEtN3ptLTEzOTctMmMtNy0xMC0yNi0xNS0zNy05LTExIDYtMTcgMTktMTUgMzEgMSAxMiA4IDIzIDE4IDMxIDExIDggMjYgOCAzNiAwIDktNyAxMi0xNSAxMC0yNC0yLTktNi0yMC0xMi0yOXptMTQ3Ni00OWMtNi0yLTEyIDAtMTcgNS0xMCAxMC0xMSAzMC0xIDQyIDEwIDExIDMwIDEwIDQxLTMgMTAtMTEgOS0zMy01LTQyLTUtMy0xMS00LTE4LTJ6bS0xMzU4LTFjLTktNS0yMy0yLTMwIDYtNyA5LTcgMjIgMSAzMCA4IDcgMjIgOCAzMSAwIDktNyAxMS0yMiA1LTMwLTMtNC01LTYtNy02em0tMTEwLTFjLTktOC0yNy04LTM4IDEtMTAgOC0xNCAyMy05IDMyIDUgOSAxOSAxMSAzMCA1IDExLTYgMTYtMTkgMTQtMzFhNDUgNDUgMCAwIDAtMTktMjF6bTE2NjAtNTRjLTctMy0xNi0xLTIzIDUtMTAgOC0xMiAyNC01IDMzIDggMTEgMjYgMTEgMzUgMiA3LTggOC0yNCAxLTMzLTItMy01LTUtOC03em0tNTgtNTVjLTMtNi04LTEwLTE1LTEwLTktMS0xOSA0LTIyIDEyLTMgOSAyIDE5IDExIDIzIDkgNCAxOSAwIDIzLTkgMy01IDMtMTEgMy0xNnptLTEzMTAtMmMtNy01LTIxIDAtMjggMTEtNyAxMC02IDI1IDMgMzMgOSA3IDI1IDYgMzQtMiA4LTggOS0yMiAzLTMxLTItNS02LTktMTItMTF6bTEzNTUtNDJjLTE4LTItMjcgMjAtMTQgMzEgOSA5IDI3IDkgMzYgMCA5LTkgOC0yNy0zLTM0LTUtNC0xMS01LTE5IDN6bS0xNDUgMmMtNS01LTE0LTQtMjAgMi04IDgtOCAyMyAwIDMxIDggOSAyNCA5IDMyIDEgOC04IDgtMjMgMC0zMS00LTQtOC01LTEyLTN6bTExMS0zMWMtNS0xLTEyIDEtMTcgNy04IDktOCAyNCAxIDMyIDggOCAyNCA4IDMyLTIgOC05IDctMjQtMy0zMS0zLTItNy00LTEzLTZ6bS0xNzctMTNjLTktNS0yNC0yLTMxIDgtNyA5LTcgMjIgMSAzMCA5IDggMjUgOCAzMyAwIDktOCAxMC0yMyAzLTMxLTMtNC01LTYtNi03em0tMzAzLTE1Yy00IDAtOCAxLTEyIDItMjIgOC0yNiAzNS03IDQ5IDggNiAyMiA4IDM0IDQgMTctNiAyMy0yNSAxNC00MC02LTktMTctMTUtMjktMTV6bTIxOC01Yy0yMC0yLTMxIDIyLTE4IDMzIDggNyAyNCA3IDMyIDAgOC03IDgtMjItMi0zMC0zLTItNy0zLTEyLTN6bS01NTQtOGMtNy0xLTE1IDItMjEgOC05IDktOCAyNSAzIDMzIDExIDcgMzAgNSA0MS01IDExLTEwIDktMjktNS0zNS02LTMtMTItNC0xOC0xeiIgLz48L3N2Zz4=";

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
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] cursor-move select-none touch-none">
      
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500">
           <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
           <div className="text-white font-bold tracking-widest text-xs uppercase">Loading Map...</div>
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
           {/* Background Map Image */}
           <div 
             className="absolute inset-0 opacity-40"
             style={{ 
               backgroundImage: RELIABLE_MAP_BG,
               backgroundSize: "cover",
               backgroundPosition: "center",
               backgroundRepeat: "no-repeat"
             }}
           />

           {/* Country Points */}
           {points.map((p) => {
              const isHovered = hovered === p.name.common;
              const dotScale = Math.max(0.4, 1 / scale); 

              return (
                <div
                  key={p.name.common}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                   {/* Tap target (larger for touch) */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                     onMouseEnter={() => setHovered(p.name.common)}
                     onMouseLeave={() => setHovered(null)}
                     className="w-8 h-8 -m-4 rounded-full cursor-pointer absolute z-20"
                     aria-label={p.name.common}
                   />
                   
                   {/* Visible Dot */}
                   <motion.div
                     initial={false}
                     animate={{ 
                       scale: isHovered ? 2 : 1, 
                       backgroundColor: isHovered ? "#fbbf24" : "rgba(255,255,255,0.6)",
                       boxShadow: isHovered ? "0 0 8px 2px #fbbf24" : "none",
                     }}
                     className="w-2 h-2 rounded-full pointer-events-none transition-colors"
                     style={{ transform: `scale(${dotScale})` }} 
                   />
                </div>
              );
           })}
        </motion.div>
      </div>

      {/* Controls Overlay - Positioned for Mobile */}
      <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 flex flex-col gap-2 z-30">
        <button 
          onClick={() => handleZoom(1)} 
          className="p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all shadow-lg" 
          title="Zoom In"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button 
          onClick={() => handleZoom(-1)} 
          className="p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all shadow-lg" 
          title="Zoom Out"
        >
          <Minus className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button 
          onClick={() => { setScale(1); setPosition({x:0,y:0}); }} 
          className="p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all shadow-lg mt-2" 
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Hover Tooltip */}
      {hovered && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 md:px-6 rounded-full shadow-xl border border-white/50 whitespace-nowrap">
            <div className="text-xs md:text-sm font-black text-slate-900 tracking-wide">{hovered}</div>
          </div>
        </div>
      )}

      {/* Mobile Hint (visible briefly or always) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none md:hidden opacity-70">
        <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
           <MapIcon className="w-3 h-3" /> Drag & Zoom
        </div>
      </div>

    </div>
  );
}