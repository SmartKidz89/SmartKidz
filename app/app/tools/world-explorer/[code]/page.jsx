"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { 
  MapPin, Utensils, Landmark, Volume2, ArrowLeft, 
  Trophy, Banknote, Sun, Sparkles, BookOpen, PartyPopper, Mountain
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CountryProfilePage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef(null);

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
    
    // Cleanup speech on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [code]);

  function speakWord(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function readPage() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    const text = `
      Welcome to ${data.name}. 
      The capital city is ${data.capital}.
      Did you know? ${data.funFact}
      Famous food includes ${data.food}.
      A famous place is ${data.landmark}.
      In ${data.name}, people say ${data.hello}.
    `;

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    speechRef.current = u;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">✈️</div>
          <div className="text-slate-600 font-bold text-xl">Flying to destination...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🤔</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">We couldn't find that place.</h2>
          <p className="text-slate-600 mb-6">It might be a connection issue or an unknown code.</p>
          <Link href="/app/tools/world-explorer">
            <Button>Back to Map</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageMotion className="max-w-5xl mx-auto pb-24">
      
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <Link href="/app/tools/world-explorer" className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-slate-700 shadow-lg hover:bg-white transition-all ring-1 ring-black/5 hover:scale-105 active:scale-95">
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </Link>
        
        <button 
          onClick={readPage}
          className={`inline-flex items-center gap-2 rounded-full backdrop-blur-md px-5 py-2.5 text-sm font-bold shadow-lg transition-all ring-1 ring-black/5 active:scale-95 ${
            speaking ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-white/90 text-slate-700 hover:bg-white"
          }`}
        >
          {speaking ? (
            <><Volume2 className="w-4 h-4 animate-bounce" /> Reading...</>
          ) : (
            <><Volume2 className="w-4 h-4" /> Read to Me</>
          )}
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white mb-8 shadow-2xl mt-4 mx-4 md:mx-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950" />
        {/* Flag Watermark */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-[20rem] leading-none select-none rotate-12 grayscale">
          {data.emoji}
        </div>
        
        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-block p-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl">
             {data.flag ? (
               <div className="relative w-28 h-20 rounded-2xl overflow-hidden shadow-sm">
                 <Image src={data.flag} alt={data.name} fill className="object-cover" />
               </div>
             ) : (
               <span className="text-7xl">{data.emoji}</span>
             )}
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 drop-shadow-xl">
            {data.name}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 text-indigo-200 font-bold text-lg">
            <span className="bg-white/10 px-3 py-1 rounded-full">{data.region}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Capital: {data.capital}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Pop: {(data.population / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        
        {/* Language Card (Large) */}
        <div className="md:col-span-2 skz-card p-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
            <Volume2 className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-200 mb-2">Language</div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
              <h2 className="text-5xl font-black">"{data.hello}"</h2>
              <span className="text-xl text-indigo-200 font-medium">in {data.language}</span>
            </div>
            <p className="text-indigo-100 font-medium mb-6 max-w-md">
              Try saying hello! Tap the button to hear how it sounds.
            </p>
            <button 
              onClick={() => speakWord(data.hello)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-indigo-700 font-bold hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Volume2 className="w-5 h-5" /> Listen
            </button>
          </div>
        </div>

        {/* Fun Fact Card */}
        <div className="skz-card p-6 bg-amber-50 border-amber-100 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-amber-200">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
             <div className="text-xs font-black uppercase tracking-wider text-amber-600 mb-2">Did You Know?</div>
             <p className="text-xl font-bold text-slate-800 leading-snug flex-1">
               {data.funFact}
             </p>
          </div>
        </div>

        {/* Food */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-2xl">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Yummy Food</div>
            <div className="text-xl font-black text-slate-900 mb-1">{data.food}</div>
            <div className="text-sm text-slate-600 leading-relaxed font-medium">
              A famous local dish.
            </div>
          </div>
        </div>

        {/* Landmark */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Must See</div>
            <div className="text-xl font-black text-slate-900 mb-1">{data.landmark}</div>
            <div className="text-sm text-slate-600 leading-relaxed font-medium">
              Iconic place to visit.
            </div>
          </div>
        </div>

        {/* History */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">History</div>
            <div className="text-sm font-bold text-slate-900 leading-relaxed">
              {data.history}
            </div>
          </div>
        </div>

        {/* Nature */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Mountain className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Nature</div>
            <div className="text-sm font-bold text-slate-900 leading-relaxed">
              {data.nature}
            </div>
          </div>
        </div>

        {/* Festival */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Celebration</div>
            <div className="text-sm font-bold text-slate-900 leading-relaxed">
              {data.festival}
            </div>
          </div>
        </div>

        {/* Animal */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
           <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-3xl">
             🐾
           </div>
           <div>
             <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Wildlife</div>
             <div className="text-xl font-black text-slate-900 mb-1">{data.animal}</div>
             <div className="text-sm text-slate-600 leading-relaxed font-medium">
               Native to this region.
             </div>
           </div>
        </div>

        {/* Sport */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
           <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
             <Trophy className="w-7 h-7" />
           </div>
           <div>
             <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Popular Sport</div>
             <div className="text-xl font-black text-slate-900 mb-1">{data.sport}</div>
             <div className="text-sm text-slate-600 leading-relaxed font-medium">
               Loved by the locals.
             </div>
           </div>
        </div>

        {/* Currency */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
           <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
             <Banknote className="w-7 h-7" />
           </div>
           <div>
             <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Money</div>
             <div className="text-xl font-black text-slate-900 mb-1">{data.currency}</div>
             <div className="text-sm text-slate-600 leading-relaxed font-medium">
               Used to buy things.
             </div>
           </div>
        </div>

        {/* Climate */}
        <div className="skz-card p-6 bg-white border-slate-200 flex gap-4 items-start hover:shadow-lg transition-shadow">
           <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
             <Sun className="w-7 h-7" />
           </div>
           <div>
             <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Weather</div>
             <div className="text-sm font-bold text-slate-800 leading-relaxed">
               {data.climate}
             </div>
           </div>
        </div>

        {/* Google Maps Link */}
        {data.googleMaps && (
          <a 
            href={data.googleMaps} 
            target="_blank" 
            rel="noopener noreferrer"
            className="md:col-span-3 skz-card p-5 bg-slate-50 border-slate-200 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors font-bold text-sm"
          >
            <MapPin className="w-4 h-4" /> View {data.name} on Google Maps
          </a>
        )}

      </div>
    </PageMotion>
  );
}