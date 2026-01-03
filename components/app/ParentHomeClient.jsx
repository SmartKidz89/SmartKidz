"use client";

import { useWeeklyReflection } from "@/components/ui/useEmotionalMoments";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveChild } from "@/hooks/useActiveChild";
import ParentInsightsDashboard from "@/components/parent/ParentInsightsDashboard";
import AvatarBadge from "@/components/app/AvatarBadge";
import { Page, BentoGrid, BentoCard, Divider } from "@/components/ui/PageScaffold";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Settings, Plus, Sparkles, BookOpen, Clock, Heart } from "lucide-react";
import ParentInsightCard from "@/components/ui/ParentInsightCard";

export default function ParentHome() {
  useWeeklyReflection({ childId: null, childName: "your child" });
  const router = useRouter();
  const { kids, activeChildId, setActiveChild, loading, error } = useActiveChild();

  function openKid(kidId) {
    setActiveChild(kidId);
    router.push("/app");
  }

  return (
    <Page
      badge="Parent Command Center"
      title="Overview"
      subtitle="Track progress, adjust settings, and celebrate the wins."
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.push("/app/children")}>
            <Plus className="w-4 h-4 mr-2" /> Add Child
          </Button>
          <Button variant="secondary" onClick={() => router.push("/app/settings")}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      }
    >
      <BentoGrid>
        
        {/* Child Selectors */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && <div className="p-6 text-slate-500 font-medium">Loading profiles...</div>}
          
          {!loading && (kids || []).map((kid) => {
             const isActive = kid.id === activeChildId;
             return (
              <button
                key={kid.id}
                onClick={() => setActiveChild(kid.id)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-[2rem] transition-all text-left group",
                  isActive 
                    ? "bg-slate-900 text-white shadow-xl ring-2 ring-slate-900 ring-offset-2" 
                    : "bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md"
                )}
              >
                <div className="relative">
                  <AvatarBadge config={kid.avatar_config} size={48} className={cn("shadow-sm", isActive ? "ring-0" : "")} />
                  {isActive && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                   <div className={cn("font-black text-lg leading-none mb-1", isActive ? "text-white" : "text-slate-900")}>
                     {kid.display_name}
                   </div>
                   <div className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-slate-400" : "text-slate-500")}>
                     Year {kid.year_level}
                   </div>
                </div>
              </button>
             );
          })}
          
          {!loading && (
             <button 
               onClick={() => router.push("/app/children")}
               className="flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
             >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold uppercase">New Profile</span>
             </button>
          )}
        </div>

        {/* Quick Stats */}
        <BentoCard className="col-span-12 lg:col-span-8 p-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
           <div className="p-6 sm:p-8">
             <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-xl">Weekly Highlights</h3>
             </div>
             
             <div className="grid grid-cols-3 gap-8">
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-1">Time Spent</div>
                   <div className="text-3xl sm:text-4xl font-black text-slate-900">45<span className="text-lg text-slate-400 ml-1">m</span></div>
                </div>
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-1">Lessons</div>
                   <div className="text-3xl sm:text-4xl font-black text-slate-900">12</div>
                </div>
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-1">Accuracy</div>
                   <div className="text-3xl sm:text-4xl font-black text-emerald-600">94%</div>
                </div>
             </div>
             
             <div className="mt-8 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
             </div>
             <div className="mt-2 text-xs font-bold text-slate-400 text-right">Weekly Goal: 65%</div>
           </div>
        </BentoCard>

        {/* Quick Links */}
        <div className="col-span-12 lg:col-span-4 grid gap-4">
           <Link href="/app/parent/reports" className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                 </div>
                 <div className="font-bold text-slate-900">Reports</div>
              </div>
              <ArrowIcon className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
           </Link>

           <Link href="/app/parent/reflections" className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-rose-100 hover:shadow-lg transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                 </div>
                 <div className="font-bold text-slate-900">Reflections</div>
              </div>
              <ArrowIcon className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
           </Link>

           <Link href="/app/parent/timeline" className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-amber-100 hover:shadow-lg transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                 </div>
                 <div className="font-bold text-slate-900">History</div>
              </div>
              <ArrowIcon className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
           </Link>
        </div>

        {/* Detailed Insights */}
        <div className="col-span-12">
           <ParentInsightsDashboard />
        </div>

      </BentoGrid>
    </Page>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}