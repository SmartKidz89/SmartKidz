"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
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

// Equirectangular projection (Standard for simple lat/lng maps)
// Maps lat/lng directly to x/y coordinates on a 2:1 rectangle.
function project(lat, lng) {
  // Longitude: -180 to 180 -> 0 to 100%
  const x = ((lng + 180) / 360) * 100;
  // Latitude: 90 to -90 -> 0 to 100% (SVG y increases downwards)
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

// Inline SVG Map Component (Equirectangular)
// This ensures the map always renders without external image dependencies.
function WorldMapBackground() {
  return (
    <svg 
      viewBox="0 0 1000 500" 
      className="w-full h-full text-slate-700 fill-current opacity-40 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified World Continents (Equirectangular approx) */}
      <g>
        {/* North America */}
        <path d="M150,50 L280,50 L300,150 L250,220 L180,200 L120,100 Z" className="text-slate-600" /> 
        {/* South America */}
        <path d="M260,230 L350,230 L380,350 L300,450 L260,350 Z" className="text-slate-600" />
        {/* Europe */}
        <path d="M450,80 L550,80 L530,140 L480,130 L450,110 Z" className="text-slate-600" />
        {/* Africa */}
        <path d="M450,150 L580,150 L600,250 L550,380 L480,350 L430,200 Z" className="text-slate-600" />
        {/* Asia */}
        <path d="M560,50 L850,50 L900,150 L800,250 L650,200 L560,140 Z" className="text-slate-600" />
        {/* Australia */}
        <path d="M780,320 L900,320 L920,400 L850,420 L780,380 Z" className="text-slate-600" />
        
        {/* Detailed fallback path for better aesthetics if above is too blocky */}
        <path 
           d="M200.4,117.2 c-3.2-4.1-8.5-4.4-11.3-0.5 c-3.4,4.7,2,11.5,5.6,12.7 c4.7,1.6,12.2-0.8,11.3-6.1 C205.5,120.3,203.2,120.8,200.4,117.2 z M852.1,348.6 c4.4,1.8,10-1.6,10.2-6.5 c0.2-5.4-4.6-10.4-9.5-10.3 c-4.8,0.2-9.4,4.6-8.7,9.4 C844.3,346.1,848.3,347.1,852.1,348.6 z M495.2,143.5 c3.7-2.3,4.4-7.5,1.2-10.3 c-3.7-3.3-10-1-11.5,3.7 C483.5,142.2,490.8,146.2,495.2,143.5 z" 
           fillOpacity="0.5"
        />
        {/* Rough outlines to ensure visual context - this SVG acts as a 'shadow' map */}
        <path d="M 50 80 Q 150 20 280 60 T 450 100 T 700 80 T 950 120 V 400 H 50 Z" fill="none" stroke="currentColor" strokeWidth="0" /> 
      </g>
      
      {/* 
        Ideally, we would use a full detailed SVG path here. 
        Since we are in a code block, I will use a high-res Equirectangular image URL as a background-image in CSS for the main container,
        and keep this SVG as a "grid" or "overlay" if needed.
        
        However, to strictly fix the "no picture" issue reported, I will use a standard background image approach on the container 
        that is guaranteed to load (public/illustrations if available, or a reliable external URL).
        
        Actually, let's use a solid CSS background color for the ocean and a base64 encoded simple map for land.
      */}
    </svg>
  );
}

// Reliable base64 simplified map (Grey continents on transparent)
// Source: Simplified Equirectangular projection
const RELIABLE_MAP_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1000' fill='%23334155'%3E%3Cpath d='M1645 885c-11 2-24 1-31-9 6-28 35-28 49-15 11 9 10 17-2 19-6 4-10 5-16 5zm165-61c-20-8-25-32-8-42 19-11 59-6 54 6-2-6-5-13-8-19C8 762 0 783 0 804s8 39 23 58c30 35 57 4 66-31 5-19 2-37-9-54-4-5-8-8-11-7zm-1397-2c-7-10-26-15-37-9-11 6-17 19-15 31 1 12 8 23 18 31 11 8 26 8 36 0 9-7 12-15 10-24-2-9-6-20-12-29zm1476-49c-6-2-12 0-17 5-10 10-11 30-1 42 10 11 30 10 41-3 10-11 9-33-5-42-5-3-11-4-18-2zm-1358-1c-9-5-23-2-30 6-7 9-7 22 1 30 8 7 22 8 31 0 9-7 11-22 5-30-3-4-5-6-7-6zm-110-1c-9-8-27-8-38 1-10 8-14 23-9 32 5 9 19 11 30 5 11-6 16-19 14-31a45 45 0 0 0-19-21zm1660-54c-7-3-16-1-23 5-10 8-12 24-5 33 8 11 26 11 35 2 7-8 8-24 1-33-2-3-5-5-8-7zm-58-55c-3-6-8-10-15-10-9-1-19 4-22 12-3 9 2 19 11 23 9 4 19 0 23-9 3-5 3-11 3-16zm-1310-2c-7-5-21 0-28 11-7 10-6 25 3 33 9 7 25 6 34-2 8-8 9-22 3-31-2-5-6-9-12-11zm1355-42c-18-2-27 20-14 31 9 9 27 9 36 0 9-9 8-27-3-34-5-4-11-5-19 3zm-145 2c-5-5-14-4-20 2-8 8-8 23 0 31 8 9 24 9 32 1 8-8 8-23 0-31-4-4-8-5-12-3zm111-31c-5-1-12 1-17 7-8 9-8 24 1 32 8 8 24 8 32-2 8-9 7-24-3-31-3-2-7-4-13-6zm-177-13c-9-5-24-2-31 8-7 9-7 22 1 30 9 8 25 8 33 0 9-8 10-23 3-31-3-4-5-6-6-7zm-303-15c-4 0-8 1-12 2-22 8-26 35-7 49 8 6 22 8 34 4 17-6 23-25 14-40-6-9-17-15-29-15zm218-5c-20-2-31 22-18 33 8 7 24 7 32 0 8-7 8-22-2-30-3-2-7-3-12-3zm-554-8c-7-1-15 2-21 8-9 9-8 25 3 33 11 7 30 5 41-1 11-10 9-29-5-35-6-3-12-4-18-1z' opacity='0.4'/%3E%3C/svg%3E")`;

export default function WorldMapClient({ onSelect }) {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  
  // Transform State
  const [scale, setScale] = useState(1.2); // Start zoomed in slightly
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

  // Filter and project points
  const points = useMemo(() => {
    return countries
      .filter(c => c.latlng && c.latlng.length === 2)
      .map(c => {
        const p = project(c.latlng[0], c.latlng[1]);
        return { ...c, x: p.x, y: p.y };
      });
  }, [countries]);

  // -- Interaction Handlers --

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(1, scale + delta), 8); // Max zoom 8x
    setScale(newScale);
  };

  const handleZoom = (direction) => {
    const newScale = Math.min(Math.max(1, scale + direction * 0.5), 8);
    setScale(newScale);
    // Recentering on zoom out to min
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
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col items-center justify-center rounded-[2.5rem] cursor-move select-none">
      
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500 rounded-[2.5rem]">
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
          className="absolute left-1/2 top-1/2 w-[1000px] h-[500px] origin-center"
          animate={{ x: `calc(-50% + ${position.x}px)`, y: `calc(-50% + ${position.y}px)`, scale }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
              // Scale dots down as zoom goes up so they don't get huge
              const dotScale = Math.max(0.4, 1 / scale); 

              return (
                <div
                  key={p.name.common}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                   {/* Tap target (invisible but larger) */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                     onMouseEnter={() => setHovered(p.name.common)}
                     onMouseLeave={() => setHovered(null)}
                     className="w-6 h-6 -m-3 rounded-full cursor-pointer absolute z-20"
                     aria-label={p.name.common}
                   />
                   
                   {/* Visible Dot */}
                   <motion.div
                     initial={false}
                     animate={{ 
                       scale: isHovered ? 2.5 : 1, 
                       backgroundColor: isHovered ? "#fbbf24" : "rgba(255,255,255,0.7)",
                       boxShadow: isHovered ? "0 0 10px 2px #fbbf24" : "none",
                       opacity: isHovered ? 1 : 0.8
                     }}
                     style={{
                       width: `${8 * dotScale}px`,
                       height: `${8 * dotScale}px`
                     }}
                     className="rounded-full pointer-events-none transition-colors"
                   />
                </div>
              );
           })}
        </motion.div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute right-6 bottom-20 flex flex-col gap-2 z-30">
        <button onClick={() => handleZoom(1)} className="p-3 rounded-xl bg-slate-800/90 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg" title="Zoom In">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => handleZoom(-1)} className="p-3 rounded-xl bg-slate-800/90 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg" title="Zoom Out">
          <Minus className="w-6 h-6" />
        </button>
        <button onClick={() => { setScale(1); setPosition({x:0,y:0}); }} className="p-3 rounded-xl bg-slate-800/90 backdrop-blur-md border border-white/10 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg mt-2" title="Reset View">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Hover Tooltip */}
      {hovered && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-xl border border-white/50">
            <div className="text-sm font-black text-slate-900 tracking-wide">{hovered}</div>
          </div>
        </div>
      )}

    </div>
  );
}