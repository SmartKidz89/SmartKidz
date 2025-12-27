"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function latLngToVec3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function Earth() {
  const meshRef = useRef();

  // Simple premium-looking material without external textures.
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0b2a4a"),
      roughness: 0.7,
      metalness: 0.05,
      emissive: new THREE.Color("#02131f"),
      emissiveIntensity: 0.35,
    });
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function CountryMarkers({ countries, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const markers = useMemo(() => {
    return countries
      .filter((c) => Array.isArray(c.latlng) && c.latlng.length === 2)
      .map((c) => {
        const [lat, lng] = c.latlng;
        return {
          id: c.cca2 || c.cca3 || c.name?.common,
          country: c,
          position: latLngToVec3(lat, lng, 1.01),
        };
      });
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
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            document.body.style.cursor = "default";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(m.country);
          }}
        >
          <sphereGeometry args={[hovered === m.id ? 0.012 : 0.008, 16, 16]} />
          <meshStandardMaterial
            color={hovered === m.id ? "#ffb703" : "#ffffff"}
            emissive={hovered === m.id ? "#ffb703" : "#000000"}
            emissiveIntensity={hovered === m.id ? 0.6 : 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function WorldGlobeClient({ onSelect }) {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // REST Countries provides names + lat/lng + codes. Good enough for MVP markers.
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,cca3,latlng,region,subregion,capital,flag");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setCountries(data);
      } catch (e) {
        // Swallow; UI will show empty markers.
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 2, 3]} intensity={1.2} />
      <pointLight position={[-2, -1, -2]} intensity={0.6} />
      <Earth />
      <CountryMarkers countries={countries} onSelect={onSelect} />
      <OrbitControls enablePan={false} minDistance={1.4} maxDistance={4} />
    </Canvas>
  );
}
