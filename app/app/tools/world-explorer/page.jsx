"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { ArrowRight, MapPin } from "lucide-react";

// Dynamically import the heavy 3D component with no SSR to avoid hydration mismatches
const WorldGlobeClient = dynamic(() => import("./WorldGlobeClient"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-[2.5rem]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Globe...</div>
      </div>
    </div>
  )
});

export default function WorldExplorerPage() {
  const [selected, setSelected] = useState(null);

  const actions = useMemo(() => {
    if (!selected) return null;
    const code = selected.cca2 || selected.cca3 || "";
    const name = selected.name?.common || "Country";
    return (
      <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="text-sm opacity-80 font-medium">Selected:</div>
        <div className="font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
          {selected.flag} {name}
        </div>
        {code ? (
          <Link
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all"
            href={`/app/tools/world-explorer/${code.toUpperCase()}`}
          >
            Explore <ArrowRight className="w-4 h-4" />
          </Link>
        ) : null}
      </div>
    );
  }, [selected]);

  return (
    <PageScaffold
      title="World Explorer"
      subtitle="Spin the globe. Tap a marker. Discover the world."
      actions={actions}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] h-[calc(100vh-280px)] min-h-[600px]">
        {/* Globe Container */}
        <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0">
            <WorldGlobeClient onSelect={setSelected} />
          </div>
          
          {/* Overlay Instructions */}
          <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center z-10">
            <div className="rounded-full bg-black/60 px-5 py-2.5 text-xs font-bold text-white/90 shadow-lg backdrop-blur border border-white/10 tracking-wide">
              Drag to rotate • Scroll to zoom • Tap a dot
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="flex flex-col h-full rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 opacity-60">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-2 shadow-inner">
                🌍
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">Pick a country</div>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed">
                  Rotate the globe and tap any white marker to see details here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="text-8xl mb-4 drop-shadow-sm transform hover:scale-110 transition-transform cursor-default select-none">
                  {selected.flag || "🏳️"}
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  {selected.name?.common}
                </h2>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">
                  {selected.region || "Unknown Region"}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Capital</div>
                  <div className="text-sm font-bold text-slate-800 truncate">
                    {selected.capital?.[0] || "N/A"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Code</div>
                  <div className="text-sm font-bold text-slate-800">
                    {selected.cca3 || selected.cca2}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-auto pt-4">
                <Link
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 text-base font-black text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:shadow-brand-primary/30 active:scale-95"
                  href={`/app/tools/world-explorer/${(selected.cca2 || selected.cca3 || "").toUpperCase()}`}
                >
                  <span>Open Travel Guide</span>
                  <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <div className="text-center mt-3 text-xs font-semibold text-slate-400">
                  Learn about food, landmarks & more
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageScaffold>
  );
}