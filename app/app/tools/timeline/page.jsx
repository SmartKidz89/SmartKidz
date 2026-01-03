"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { ArrowLeft, RefreshCw, Calendar, Trophy, CheckCircle2, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ChildAvatar from "@/components/avatar/ChildAvatar";

function TimelineItem({ item, isLast }) {
  const dateObj = new Date(item.date);
  const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const colors = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  const css = colors[item.color] || colors.emerald;

  return (
    <div className="relative pl-8 sm:pl-12 py-2">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[23px] top-8 bottom-0 w-0.5 bg-slate-200" />
      )}
      
      {/* Node */}
      <div className={cn(
        "absolute left-0 sm:left-2 top-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base shadow-sm border-2 border-white z-10",
        css
      )}>
        {item.icon}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start gap-4">
          <div>
             <h4 className="font-bold text-slate-900 text-sm sm:text-base capitalize">{item.title}</h4>
             <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-medium">{item.subtitle}</p>
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 text-right shrink-0">
             <div>{dateStr}</div>
             <div className="font-normal opacity-80">{timeStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { activeChild } = useActiveChild();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!activeChild?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/timeline?childId=${activeChild.id}`);
      const data = await res.json();
      setTimeline(data.timeline || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [activeChild?.id]);

  return (
    <PageMotion className="max-w-3xl mx-auto pb-24 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
             <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Time Machine</h1>
            <p className="text-slate-600 font-medium">Your journey so far.</p>
          </div>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500"
        >
           <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 min-h-[500px]">
        {/* Child Header */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-200">
           <div className="relative">
             <ChildAvatar config={activeChild?.avatar_config} size={64} className="shadow-lg" />
             <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
               PRO
             </div>
           </div>
           <div>
             <h2 className="text-xl font-black text-slate-900">{activeChild?.display_name || "Student"}</h2>
             <div className="flex gap-3 mt-1">
               <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                 Year {activeChild?.year_level}
               </span>
               <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                 Active
               </span>
             </div>
           </div>
        </div>

        {/* Timeline Stream */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-200" />
                 <div className="h-16 flex-1 bg-slate-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-10 opacity-60">
             <div className="text-5xl mb-4">🕰️</div>
             <p className="font-bold text-slate-900">No history yet</p>
             <p className="text-sm">Complete a lesson to start your timeline!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((item, i) => (
              <TimelineItem key={item.id} item={item} isLast={i === timeline.length - 1} />
            ))}
            
            <div className="text-center pt-8">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Calendar className="w-3 h-3" /> Start of Journey
               </div>
            </div>
          </div>
        )}
      </div>
    </PageMotion>
  );
}