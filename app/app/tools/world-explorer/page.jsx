"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Search, Loader2, MapPin, Globe, Compass } from "lucide-react";

// Robust Fallback Data for offline/error states
const FALLBACK_COUNTRIES = [
  { name: { common: "Australia" }, cca2: "AU", region: "Oceania", capital: ["Canberra"], flags: { png: "https://flagcdn.com/w320/au.png", svg: "https://flagcdn.com/au.svg" } },
  { name: { common: "United States" }, cca2: "US", region: "Americas", capital: ["Washington, D.C."], flags: { png: "https://flagcdn.com/w320/us.png", svg: "https://flagcdn.com/us.svg" } },
  { name: { common: "United Kingdom" }, cca2: "GB", region: "Europe", capital: ["London"], flags: { png: "https://flagcdn.com/w320/gb.png", svg: "https://flagcdn.com/gb.svg" } },
  { name: { common: "France" }, cca2: "FR", region: "Europe", capital: ["Paris"], flags: { png: "https://flagcdn.com/w320/fr.png", svg: "https://flagcdn.com/fr.svg" } },
  { name: { common: "Japan" }, cca2: "JP", region: "Asia", capital: ["Tokyo"], flags: { png: "https://flagcdn.com/w320/jp.png", svg: "https://flagcdn.com/jp.svg" } },
  { name: { common: "Brazil" }, cca2: "BR", region: "Americas", capital: ["Brasília"], flags: { png: "https://flagcdn.com/w320/br.png", svg: "https://flagcdn.com/br.svg" } },
  { name: { common: "Egypt" }, cca2: "EG", region: "Africa", capital: ["Cairo"], flags: { png: "https://flagcdn.com/w320/eg.png", svg: "https://flagcdn.com/eg.svg" } },
  { name: { common: "India" }, cca2: "IN", region: "Asia", capital: ["New Delhi"], flags: { png: "https://flagcdn.com/w320/in.png", svg: "https://flagcdn.com/in.svg" } },
  { name: { common: "China" }, cca2: "CN", region: "Asia", capital: ["Beijing"], flags: { png: "https://flagcdn.com/w320/cn.png", svg: "https://flagcdn.com/cn.svg" } },
  { name: { common: "Canada" }, cca2: "CA", region: "Americas", capital: ["Ottawa"], flags: { png: "https://flagcdn.com/w320/ca.png", svg: "https://flagcdn.com/ca.svg" } },
  { name: { common: "Italy" }, cca2: "IT", region: "Europe", capital: ["Rome"], flags: { png: "https://flagcdn.com/w320/it.png", svg: "https://flagcdn.com/it.svg" } },
  { name: { common: "Germany" }, cca2: "DE", region: "Europe", capital: ["Berlin"], flags: { png: "https://flagcdn.com/w320/de.png", svg: "https://flagcdn.com/de.svg" } },
];

const FLAG_OVERRIDES = {
  // Using a stable wikimedia link for the Republic flag
  AF: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/320px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png"
};

export default function WorldExplorerGrid() {
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API error");
        
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length > 0) {
          // Sort by name
          data.sort((a, b) => a.name.common.localeCompare(b.name.common));
          setCountries(data);
        }
      } catch (e) {
        console.warn("Using fallback country data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Filter Logic
  const filtered = useMemo(() => {
    return countries.filter(c => {
      const matchesSearch = c.name.common.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = regionFilter === "All" || c.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [countries, query, regionFilter]);

  const regions = ["All", ...new Set(countries.map(c => c.region).filter(Boolean))].sort();

  return (
    <PageMotion className="max-w-6xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-2">
            <Globe className="w-4 h-4" /> Travel Guide
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">World Explorer</h1>
          <p className="text-slate-600 font-medium mt-2 max-w-xl">
            Pick a flag to start your adventure.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search country..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 h-12 pl-10 pr-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
          
          <div className="relative">
             <select
               value={regionFilter}
               onChange={(e) => setRegionFilter(e.target.value)}
               className="w-full sm:w-40 h-12 pl-4 pr-10 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none shadow-sm cursor-pointer"
             >
               {regions.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
               ▼
             </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <Loader2 className="w-10 h-10 animate-spin mb-4" />
           <p className="font-bold uppercase tracking-widest text-xs">Loading Countries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
           <div className="text-4xl mb-4">🌏</div>
           <h3 className="text-xl font-bold text-slate-700">No countries found</h3>
           <p className="text-slate-500 mt-2">Try searching for something else.</p>
           <button 
             onClick={() => { setQuery(""); setRegionFilter("All"); }}
             className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-full font-bold text-slate-600 shadow-sm hover:bg-slate-100"
           >
             Clear Filters
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2 md:px-0">
           {filtered.map((country) => {
             const flagSrc = FLAG_OVERRIDES[country.cca2] || country.flags.svg || country.flags.png;
             
             return (
               <Link 
                 key={country.cca2} 
                 href={`/app/tools/world-explorer/${country.cca2}`}
                 className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
               >
                  {/* Flag Aspect */}
                  <div className="aspect-[1.6] relative bg-slate-50 overflow-hidden">
                     <Image 
                       src={flagSrc} 
                       alt={`Flag of ${country.name.common}`}
                       fill
                       className="object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col">
                     <h3 className="font-black text-slate-900 leading-tight mb-1 line-clamp-1" title={country.name.common}>
                       {country.name.common}
                     </h3>
                     <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                        <Compass className="w-3 h-3" /> {country.region}
                     </div>
                     
                     <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-500 truncate max-w-[80px]">
                          {country.capital?.[0] || "No Capital"}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                          <MapPin className="w-3 h-3" />
                        </div>
                     </div>
                  </div>
               </Link>
             );
           })}
        </div>
      )}
      
    </PageMotion>
  );
}