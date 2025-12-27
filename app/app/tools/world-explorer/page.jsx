"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { ArrowRight, MapPin } from "lucide-react";

// Dynamically import the map component
const WorldGlobeClient = dynamic(() => import("./WorldGlobeClient"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-[2rem] md:rounded-[2.5rem]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Map...</div>
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
        <div className="hidden sm:block text-sm opacity-80 font-medium">Selected:</div>
        <div className="font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-sm sm:text-base">
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
      <div className="flex flex-col gap-6 md:gap-8 pb-20">
        
        {/* Map Container - Responsive Height */}
        <div className="relative w-full h-[50vh] min-h-[350px] md:h-[60vh] md:min-h-[500px] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0">
            <WorldGlobeClient onSelect={setSelected} />
          </div>
          
          {/* Overlay Instructions (Desktop Only to save space on mobile) */}
          <div className="hidden md:flex pointer-events-none absolute bottom-6 left-0 right-0 justify-center z-10">
            <div className="rounded-full bg-black/60 px-5 py-2.5 text-xs font-bold text-white/90 shadow-lg backdrop-blur border border-white/10 tracking-wide">
              Tap a gold dot to see details
            </div>
          </div>
        </div>

        {/* Details Panel - Underneath */}
        <div className="w-full">
          {!selected ? (
            <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4 shadow-sm">
                👆
              </div>
              <div className="text-lg md:text-xl font-black text-slate-400">Pick a location</div>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Tap any marker on the map to reveal country facts.
              </p>
            </div>
          ) : (
            <div className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                
                {/* Flag & Title */}
                <div className="flex-1 w-full">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl md:text-8xl drop-shadow-sm cursor-default select-none hover:scale-105 transition-transform">
                        {selected.flag || "🏳️"}
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                          {selected.name?.common}
                        </h2>
                        <div className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">
                          {selected.region || "Unknown Region"}
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 md:gap-3">
                      <div className="bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-100">
                         <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capital</div>
                         <div className="font-bold text-slate-900 text-sm md:text-base">{selected.capital?.[0] || "N/A"}</div>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-100">
                         <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code</div>
                         <div className="font-bold text-slate-900 text-sm md:text-base">{selected.cca3 || selected.cca2}</div>
                      </div>
                   </div>
                </div>

                {/* CTA */}
                <div className="w-full md:w-auto flex flex-col justify-center gap-3">
                  <Link
                    className="group flex w-full md:w-auto items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 md:px-8 md:py-5 text-base md:text-lg font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
                    href={`/app/tools/world-explorer/${(selected.cca2 || selected.cca3 || "").toUpperCase()}`}
                  >
                    <span>Open Travel Guide</span>
                    <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </Link>
                  <div className="text-center text-xs font-semibold text-slate-400">
                    Food, animals, fun facts & more
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </PageScaffold>
  );
}