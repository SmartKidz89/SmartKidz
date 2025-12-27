"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

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

function latLngToPos(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial 
        color="#1e40af" 
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function CountryMarkers({ countries, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const markers = useMemo(() => {
    return (countries || [])
      .filter((c) => Array.isArray(c.latlng) && c.latlng.length === 2)
      .map((c) => {
        const [lat, lng] = c.latlng;
        // Basic validation
        if (isNaN(lat) || isNaN(lng)) return null;
        return {
          id: c.cca2 || c.cca3 || c.name?.common,
          country: c,
          position: latLngToPos(lat, lng, 1.02),
        };
      })
      .filter(Boolean);
  }, [countries]);

  return (
    <group>
      {markers.map((m) => (
        <mesh
          key={m.id}
          position={m.position}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(m.id);
            if (typeof document !== 'undefined') document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            if (typeof document !== 'undefined') document.body.style.cursor = "default";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(m.country);
          }}
        >
          <sphereGeometry args={[hovered === m.id ? 0.03 : 0.018, 16, 16]} />
          <meshStandardMaterial
            color={hovered === m.id ? "#fbbf24" : "#ffffff"} 
            emissive={hovered === m.id ? "#d97706" : "#000000"}
            emissiveIntensity={hovered === m.id ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function WorldGlobeClient({ onSelect }) {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [loaded, setLoaded] = useState(false);

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
        // Fallback is already set in initial state
      } finally {
        if (mounted) setLoaded(true);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full relative bg-slate-900 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[-5, -3, -5]} intensity={0.5} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <Earth />
        <CountryMarkers countries={countries} onSelect={onSelect} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={1.6} 
          maxDistance={5} 
          rotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.1}
          autoRotate={!loaded}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 px-4 py-2 rounded-full text-white text-xs font-bold backdrop-blur-md animate-pulse">
            Loading Map...
          </div>
        </div>
      )}
    </div>
  );
}