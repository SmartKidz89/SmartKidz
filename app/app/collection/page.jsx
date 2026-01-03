"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Sticker definitions for consistent UI
const STICKER_META = {
  default: { icon: "⭐", bg: "bg-slate-100", ring: "ring-slate-200" },
  reading: { icon: "📚", bg: "bg-indigo-100", ring: "ring-indigo-300" },
  maths: { icon: "➗", bg: "bg-sky-100", ring: "ring-sky-300" },
  science: { icon: "🧪", bg: "bg-emerald-100", ring: "ring-emerald-300" },
  writing: { icon: "✍️", bg: "bg-amber-100", ring: "ring-amber-300" },
  lesson: { icon: "🎓", bg: "bg-fuchsia-100", ring: "ring-fuchsia-300" },
};

function getStickerStyle(id) {
  if (id.includes("reading")) return STICKER_META.reading;
  if (id.includes("math")) return STICKER_META.maths;
  if (id.includes("science")) return STICKER_META.science;
  if (id.includes("writing")) return STICKER_META.writing;
  if (id.includes("lesson")) return STICKER_META.lesson;
  return STICKER_META.default;
}

function loadLocalStickers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("skz_collection_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const stickersObj = parsed.stickers || {};
    return Object.keys(stickersObj).map(key => ({
      id: key,
      unlockedAt: stickersObj[key].unlockedAt || Date.now()
    }));
  } catch {
    return [];
  }
}

// Helper to seed data for testing
function seedDemoStickers() {
  if (typeof window === "undefined") return;
  const demo = {
    stickers: {
      "math:lesson:1": { unlockedAt: Date.now() },
      "reading:story:2": { unlockedAt: Date.now() - 86400000 },
      "science:lab:1": { unlockedAt: Date.now() - 172800000 },
    }
  };
  window.localStorage.setItem("skz_collection_v1", JSON.stringify(demo));
  window.location.reload();
}

export default function CollectionPage() {
  const { activeChild } = useActiveChild();
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading a bit for effect
    setTimeout(() => {
      setStickers(loadLocalStickers());
      setLoading(false);
    }, 400);
  }, []);

  return (
    <PageMotion className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-2xl shadow-lg transform -rotate-6">
              ⭐
            </span>
            Sticker Book
          </h1>
          <p className="text-slate-600 font-medium mt-2 text-lg">
            Every lesson you finish adds a shiny sticker to your collection.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <Trophy className="w-5 h-5 text-amber-500" />
             <div className="flex flex-col leading-none">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
               <span className="text-xl font-black text-slate-900">{stickers.length}</span>
             </div>
          </div>
          <Link href="/app">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="aspect-square rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : stickers.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50 border-dashed border-4 border-slate-200 shadow-none">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-4xl">
             📭
           </div>
           <h3 className="text-2xl font-black text-slate-400 mb-2">No stickers yet</h3>
           <p className="text-slate-500 font-medium mb-6 max-w-sm mx-auto">
             Complete your first lesson to earn a sticker!
           </p>
           <div className="flex justify-center gap-3">
             <Link href="/app/worlds">
               <Button size="lg" className="shadow-lg">Start a Lesson</Button>
             </Link>
             <button onClick={seedDemoStickers} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">
               (Demo Data)
             </button>
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stickers.map((s, i) => {
            const style = getStickerStyle(s.id);
            const label = s.id.split(':').pop()?.replace(/_/g, ' ') || "Sticker";
            
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                className={`group aspect-[4/5] rounded-[2rem] bg-white border-2 border-slate-100 p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${style.ring} hover:ring-4`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${style.bg} group-hover:scale-110 transition-transform duration-300`}>
                   {style.icon}
                </div>
                
                <div className="text-center">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                    {new Date(s.unlockedAt).toLocaleDateString()}
                  </div>
                  <div className="font-bold text-slate-900 leading-tight capitalize text-sm">
                    {label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageMotion>
  );
}