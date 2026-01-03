"use client";

import { useEffect, useState, useMemo } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Clock, BookOpen, Target, Trophy, ArrowUp, ChevronDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AvatarBadge from "@/components/app/AvatarBadge";

// Helper to format duration
function formatDuration(ms) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h ${mins % 60}m`;
}

export default function ParentAnalyticsPage() {
  const { kids, activeChildId, setActiveChild } = useActiveChild();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load data when active child changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!activeChildId) { setStats(null); setLoading(false); return; }

      // 1. Fetch Lesson Progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, mastery_score")
        .eq("child_id", activeChildId);

      const completed = (progressData || []).filter(p => p.status === 'completed');
      
      // 2. Fetch Completed Lessons details
      const lessonIds = completed.map(p => p.lesson_id);
      
      let lessons = [];
      if (lessonIds.length > 0) {
         const { data: lData } = await supabase
           .from("lesson_editions")
           .select("id, title, subject_id, topic")
           .in("edition_id", lessonIds);
         lessons = lData || [];
      }

      // 3. Fetch Recent Activity (Attempts) for timeline
      const { data: attempts } = await supabase
         .from("attempts")
         .select("*")
         .eq("child_id", activeChildId) 
         .order("created_at", { ascending: false })
         .limit(10);
      
      // Calculate Stats
      const totalLessons = completed.length;
      const avgMastery = completed.length ? (completed.reduce((a, b) => a + (b.mastery_score || 0), 0) / completed.length) * 100 : 0;
      
      // Calculate subject breakdown
      const bySubject = {};
      lessons.forEach(l => {
         const s = l.subject_id || "Other";
         if (!bySubject[s]) bySubject[s] = 0;
         bySubject[s]++;
      });

      // Mock time calculation (since we might not have exact session logs yet)
      // Assuming avg 10 mins per completed lesson
      const totalTimeMs = totalLessons * 10 * 60 * 1000; 

      setStats({
        totalLessons,
        avgMastery,
        totalTimeMs,
        bySubject,
        recent: attempts || []
      });
      
      setLoading(false);
    }
    load();
  }, [activeChildId]);

  const activeKid = kids.find(k => k.id === activeChildId) || kids[0];

  return (
    <PageMotion className="max-w-6xl mx-auto pb-20 pt-8">
      
      {/* Header & Child Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 px-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics & Insights</h1>
          <p className="text-slate-600 font-medium">Deep dive into learning progress.</p>
        </div>

        {/* Custom Dropdown for Child */}
        <div className="relative z-20">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-2xl p-2 pr-4 hover:shadow-md transition-all active:scale-95"
          >
            <AvatarBadge config={activeKid?.avatar_config} size={40} />
            <div className="text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viewing</div>
              <div className="text-sm font-black text-slate-900 leading-none">{activeKid?.display_name || "Select Child"}</div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 ml-2 transition-transform", dropdownOpen && "rotate-180")} />
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
             <>
               <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
               <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                  {kids.map(k => (
                    <button 
                      key={k.id}
                      onClick={() => { setActiveChild(k.id); setDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left ${k.id === activeChildId ? 'bg-indigo-50/50' : ''}`}
                    >
                      <AvatarBadge config={k.avatar_config} size={32} />
                      <span className="font-bold text-slate-700 text-sm">{k.display_name}</span>
                      {k.id === activeChildId && <CheckCircle2 className="w-4 h-4 text-indigo-500 ml-auto" />}
                    </button>
                  ))}
               </div>
             </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
           <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
           <div className="text-slate-500 font-bold">Crunching the numbers...</div>
        </div>
      ) : (
        <div className="space-y-8 px-4">
           
           {/* Top Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="p-6 flex items-center gap-5 border-l-4 border-l-indigo-500">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-7 h-7" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lessons Done</div>
                    <div className="text-3xl font-black text-slate-900">{stats?.totalLessons || 0}</div>
                 </div>
              </Card>

              <Card className="p-6 flex items-center gap-5 border-l-4 border-l-emerald-500">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Target className="w-7 h-7" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Mastery</div>
                    <div className="text-3xl font-black text-slate-900">{Math.round(stats?.avgMastery || 0)}%</div>
                 </div>
              </Card>

              <Card className="p-6 flex items-center gap-5 border-l-4 border-l-amber-500">
                 <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock className="w-7 h-7" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Learning</div>
                    <div className="text-3xl font-black text-slate-900">{formatDuration(stats?.totalTimeMs || 0)}</div>
                 </div>
              </Card>
           </div>

           <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
              
              {/* Subject Breakdown */}
              <Card className="p-8">
                 <h3 className="text-xl font-black text-slate-900 mb-6">Subject Focus</h3>
                 {Object.keys(stats?.bySubject || {}).length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No data available yet.</div>
                 ) : (
                    <div className="space-y-5">
                       {Object.entries(stats?.bySubject || {}).map(([subject, count]) => {
                          const pct = (count / (stats?.totalLessons || 1)) * 100;
                          return (
                            <div key={subject}>
                                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                  <span>{subject}</span>
                                  <span>{count} lessons</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
              </Card>

              {/* Insights / Tips */}
              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                       <Sparkles className="w-6 h-6 text-yellow-300" />
                       <h3 className="font-bold text-lg">AI Insight</h3>
                    </div>
                    <p className="text-indigo-100 leading-relaxed font-medium">
                       {activeKid?.display_name} is showing strong consistency. 
                       Try introducing a new topic next to broaden their horizon!
                    </p>
                 </div>

                 <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                    {stats?.recent?.length === 0 ? (
                      <div className="text-sm text-slate-500">No recent activity logged.</div>
                    ) : (
                      <div className="space-y-4">
                         {stats?.recent?.map((item, i) => (
                           <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              <div>
                                 <div className="text-sm font-bold text-slate-800">{item.activity_id || "Lesson"}</div>
                                 <div className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                 </Card>
              </div>

           </div>
        </div>
      )}
    </PageMotion>
  );
}