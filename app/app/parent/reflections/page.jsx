"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Smile, Frown, Meh, Sun, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }); }
  catch { return ""; }
}

const MOOD_ICONS = {
  happy: { icon: Smile, color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
  proud: { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-100" },
  ok: { icon: Meh, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
  tired: { icon: CloudRain, color: "text-slate-500", bg: "bg-slate-50 border-slate-100" },
  stuck: { icon: Frown, color: "text-rose-500", bg: "bg-rose-50 border-rose-100" },
};

export default function ParentReflectionsPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!childId) { setItems([]); setLoading(false); return; }
      const { data } = await supabase
        .from("child_reflections")
        .select("id, mood, easy, tricky, proud, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(20);
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, [childId]);

  return (
    <PageMotion className="max-w-3xl mx-auto pb-20 pt-8">
       {/* Header */}
      <div className="flex items-center gap-4 mb-10 px-4">
        <Link href="/app/parent" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reflections</h1>
          <p className="text-slate-600 font-medium">A journal of how they are feeling.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 px-4">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 px-6">
           <div className="text-4xl mb-4 grayscale opacity-50">🌱</div>
           <h3 className="font-bold text-slate-900 text-lg">No entries yet</h3>
           <p className="text-slate-500">When your child completes the "Daily Reflection" tool, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6 px-4">
           {items.map((item) => {
             const style = MOOD_ICONS[item.mood] || MOOD_ICONS.ok;
             const Icon = style.icon;

             return (
               <div key={item.id} className={cn("p-6 rounded-[2rem] border-2 transition-all hover:shadow-lg", style.bg)}>
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm", style.color)}>
                           <Icon className="w-7 h-7" />
                        </div>
                        <div>
                           <div className="font-bold text-slate-900 capitalize text-lg">{item.mood}</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{formatDate(item.created_at)}</div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 pl-2">
                     {item.proud && (
                       <div>
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Proud of</div>
                         <p className="text-slate-800 font-medium text-lg leading-snug">"{item.proud}"</p>
                       </div>
                     )}
                     {item.tricky && (
                       <div className="pt-2 border-t border-black/5">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Found Tricky</div>
                         <p className="text-slate-700">"{item.tricky}"</p>
                       </div>
                     )}
                     {item.easy && (
                       <div className="pt-2 border-t border-black/5">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Found Easy</div>
                         <p className="text-slate-700">"{item.easy}"</p>
                       </div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      )}
    </PageMotion>
  );
}