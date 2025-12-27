"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import { Trophy, Star, BookOpen, Crown, Calendar, ArrowUp } from "lucide-react";
import ChildAvatar from "@/components/avatar/ChildAvatar";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { 
      weekday: "short", 
      month: "long", 
      day: "numeric" 
    });
  } catch { return ""; }
}

function TimelineItem({ item, index, isLast }) {
  const isLeft = index % 2 === 0;
  
  const icon = {
    start: <Star className="w-5 h-5 text-amber-500" />,
    lesson: <BookOpen className="w-5 h-5 text-indigo-500" />,
    badge: <Trophy className="w-5 h-5 text-emerald-500" />,
    streak: <Calendar className="w-5 h-5 text-rose-500" />,
    milestone: <Crown className="w-5 h-5 text-amber-500" />,
  }[item.type] || <Star className="w-5 h-5 text-slate-500" />;

  return (
    <div className={`flex gap-4 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} relative`}>
      {/* Center Line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2">
        {!isLast && <div className="absolute top-0 bottom-0 w-full bg-gradient-to-b from-slate-200 to-slate-100" />}
      </div>

      {/* Icon Node */}
      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center z-10">
        {icon}
      </div>

      {/* Content Card */}
      <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            item.type === 'badge' ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            {formatDate(item.at)}
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">{item.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
          
          {item.meta && (
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isLeft ? 'md:ml-auto' : ''
            } bg-slate-50 text-slate-600`}>
              {item.meta}
            </div>
          )}
        </div>
      </div>
      
      {/* Empty space for the other side */}
      <div className="hidden md:block w-1/2" />
    </div>
  );
}

export default function AchievementTimelinePage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      if (!childId) { setItems([]); setLoading(false); return; }

      // 1. Fetch Lessons
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, updated_at, status")
        .eq("child_id", childId)
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      // 2. Fetch Badges
      const { data: badges } = await supabase
        .from("child_badges")
        .select("badge_id, awarded_at")
        .eq("child_id", childId);

      // 3. Fetch Reflections
      const { data: reflections } = await supabase
        .from("child_reflections")
        .select("id, mood, proud, created_at")
        .eq("child_id", childId);

      if (!mounted) return;

      const timeline = [];

      // Process Lessons
      if (progress?.length) {
        // Fetch lesson details
        const ids = progress.map(p => p.lesson_id);
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id, title, topic")
          .in("id", ids);
        
        const lessonMap = new Map(lessons?.map(l => [l.id, l]));

        progress.forEach(p => {
          const l = lessonMap.get(p.lesson_id);
          timeline.push({
            id: `lesson_${p.lesson_id}`,
            type: "lesson",
            title: l?.title || "Lesson Completed",
            body: l?.topic || "Great work completing this lesson!",
            at: p.updated_at,
            meta: "Completed"
          });
        });

        // Add "Start" node
        timeline.push({
          id: "start",
          type: "start",
          title: "Journey Started",
          body: "The first step of a big adventure.",
          at: progress[progress.length - 1].updated_at
        });
      }

      // Process Badges
      badges?.forEach(b => {
        timeline.push({
          id: `badge_${b.badge_id}`,
          type: "badge",
          title: "Badge Earned!",
          body: `You unlocked the ${b.badge_id.replace(/_/g, ' ')} badge.`,
          at: b.awarded_at,
          meta: "Achievement"
        });
      });

      // Process Reflections
      reflections?.forEach(r => {
        if (!r.proud) return; // Only show proud moments on public timeline
        timeline.push({
          id: `ref_${r.id}`,
          type: "milestone",
          title: "A Proud Moment",
          body: `"${r.proud}"`,
          at: r.created_at,
          meta: "Reflection"
        });
      });

      // Sort & Set
      timeline.sort((a,b) => new Date(b.at) - new Date(a.at));
      setItems(timeline);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId]);

  return (
    <PageMotion className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full blur-xl opacity-50" />
          <ChildAvatar config={activeChild?.avatar_config} size={80} className="relative shadow-xl" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {activeChild?.display_name ? `${activeChild.display_name}'s Journey` : "Your Journey"}
          </h1>
          <p className="text-slate-600 font-medium mt-2">Every step counts. Look how far you've come!</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
          Loading history...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-3xl bg-slate-50 border border-slate-100">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-slate-900">Map is empty</h3>
          <p className="text-slate-600 mt-2">Complete your first lesson to start your timeline.</p>
        </div>
      ) : (
        <div className="space-y-8 relative">
           {items.map((item, i) => (
             <TimelineItem key={item.id} item={item} index={i} isLast={i === items.length - 1} />
           ))}
           
           <div className="text-center pt-8">
             <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
               <ArrowUp className="w-4 h-4" /> Start of Adventure
             </div>
           </div>
        </div>
      )}
    </PageMotion>
  );
}