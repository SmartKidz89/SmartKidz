"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { playUISound } from "@/components/ui/sound";
import { MapPin, Utensils, Landmark, Globe, Volume2, ArrowLeft, Stamp } from "lucide-react";
import { useParams } from "next/navigation";

export default function CountryProfilePage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/world-explorer/country?code=${code}`);
        if (!res.ok) throw new Error("Could not load country data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">✈️</div>
          <div className="text-slate-600 font-bold">Flying there now...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <div className="text-slate-600 mb-4">Oops! We got lost.</div>
        <Link href="/app/tools/world-explorer" className="skz-btn-primary">
          Back to Map
        </Link>
      </div>
    );
  }

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20">
      
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/app/tools/world-explorer" className="skz-chip px-4 py-2 skz-press flex items-center gap-2 bg-white/90 backdrop-blur">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white mb-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90" />
        {/* Abstract Flag Background Effect */}
        <div className="absolute -right-20 -top-20 opacity-20 text-[15rem] leading-none select-none rotate-12">
          {data.emoji}
        </div>
        
        <div className="relative z-10 p-8 sm:p-12 text-center">
          <div className="inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-lg">
             {data.flag ? (
               <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden shadow-sm">
                 <Image src={data.flag} alt={data.name} fill className="object-cover" />
               </div>
             ) : (
               <span className="text-6xl">{data.emoji}</span>
             )}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-2 drop-shadow-md">
            {data.name}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 text-indigo-200 font-bold text-lg">
            <span>{data.region}</span>
            <span>•</span>
            <span>Capital: {data.capital || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        
        {/* Hello / Language Card */}
        <div className="skz-card p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-4 right-4 text-indigo-200 group-hover:text-indigo-300 transition-colors">
            <Volume2 className="w-8 h-8" />
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-2">Language</div>
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-4xl font-black text-indigo-900">"{data.hello}"</h2>
          </div>
          <div className="text-slate-600 font-medium mb-4">
            That means "Hello" in <span className="text-indigo-700 font-bold">{data.language}</span>.
          </div>
          <button 
            onClick={() => speak(data.hello)}
            className="skz-chip px-4 py-2 bg-indigo-600 text-white border-none hover:bg-indigo-700"
          >
            🔊 Listen
          </button>
        </div>

        {/* Fun Fact Card */}
        <div className="skz-card p-6 bg-gradient-to-br from-amber-50 to-white border-amber-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-4 right-4 text-amber-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2">Did You Know?</div>
          <p className="text-xl font-bold text-slate-800 leading-snug">
            {data.funFact}
          </p>
        </div>

        {/* Food Card */}
        <div className="skz-card p-6 bg-white border-slate-100 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Famous Food</div>
            <div className="text-lg font-black text-slate-900 mb-1">{data.food}</div>
            <div className="text-sm text-slate-600 leading-relaxed">
              Yum! This is a very popular dish here.
            </div>
          </div>
        </div>

        {/* Landmark Card */}
        <div className="skz-card p-6 bg-white border-slate-100 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Must See</div>
            <div className="text-lg font-black text-slate-900 mb-1">{data.landmark}</div>
            <div className="text-sm text-slate-600 leading-relaxed">
              A famous place that many people visit.
            </div>
          </div>
        </div>

        {/* Animal Card */}
        <div className="md:col-span-2 skz-card p-6 bg-gradient-to-r from-sky-50 to-white border-sky-100 flex items-center justify-between gap-6">
           <div>
             <div className="text-xs font-black uppercase tracking-wider text-sky-500 mb-1">Wildlife</div>
             <div className="text-xl font-black text-slate-900">Look out for the {data.animal}!</div>
           </div>
           <div className="text-4xl">🐾</div>
        </div>

        {/* Google Maps Link */}
        {data.googleMaps && (
          <a 
            href={data.googleMaps} 
            target="_blank" 
            rel="noopener noreferrer"
            className="md:col-span-2 skz-card p-4 bg-slate-900 text-white flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors font-bold"
          >
            <MapPin className="w-5 h-5" /> View on Real Map
          </a>
        )}

      </div>
    </PageMotion>
  );
}