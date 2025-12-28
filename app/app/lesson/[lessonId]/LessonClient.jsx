"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, BookOpen, Compass, BrainCircuit, Sparkles, CheckCircle2, Eye, Pencil, MessageCircle } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRewards } from "@/components/ui/RewardProvider";
import { playUISound, haptic } from "@/components/ui/sound";
import { cn } from "@/lib/utils";

import { getSupabaseClient } from "@/lib/supabaseClient";
import { ACTIVE_CHILD_COOKIE, getCookie } from "@/lib/childCookie";

import { addSeasonXp } from "@/components/app/SeasonPassPanel";
import { unlockSticker } from "@/components/app/CollectionBook";
import { useEconomy } from "@/lib/economy/client";

import { lessonTelemetry } from "@/lib/lesson/telemetry";

import CoachBanner from "@/components/ui/CoachBanner";

function safeText(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

function ConfettiBurst({ show, onDone }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    (async () => {
      try {
        if (reduce) return;
        const mod = await import("canvas-confetti");
        if (cancelled) return;
        mod.default({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
        setTimeout(() => {
          try {
            mod.default({ particleCount: 80, spread: 90, origin: { y: 0.55 } });
          } catch {}
        }, 180);
      } catch {}
    })();
    const t = setTimeout(() => onDone?.(), 650);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [show, onDone, reduce]);
  return null;
}

function RichText({ text }) {
  if (!text) return null;
  return (
    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
      {text}
    </div>
  );
}

// --- NEW: Rich Activity Renderer ---
function ActivityItem({ activity, index, mediaMap, onInteract }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);

  // Find associated image if any
  const imageId = activity.media_refs?.[0];
  const imageObj = imageId ? mediaMap[imageId] : null;
  const imageUrl = imageObj?.variants?.[0]?.public_url || imageObj?.public_url;

  const handleSubmit = () => {
    if (completed) return;
    // Simple completion logic for now - in real app, validate against activity.answer_key
    setCompleted(true);
    setFeedback({ type: "success", msg: "Great work!" });
    onInteract?.(index, { completed: true, input });
    playUISound("success");
  };

  const getIcon = (type) => {
    if (type === "visual_observe") return <Eye className="w-5 h-5 text-sky-500" />;
    if (type === "trace_write") return <Pencil className="w-5 h-5 text-amber-500" />;
    if (type === "reflection") return <MessageCircle className="w-5 h-5 text-purple-500" />;
    return <Sparkles className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {imageUrl && (
        <div className="relative w-full h-64 bg-slate-100">
           <Image 
             src={imageUrl} 
             alt={activity.title || "Activity image"} 
             fill 
             className="object-contain" 
           />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
             {getIcon(activity.type)}
           </div>
           <div className="font-bold text-slate-900">{activity.title || `Activity ${index + 1}`}</div>
        </div>

        <div className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">
          {activity.prompt}
        </div>

        {/* Input Area based on type */}
        <div className="space-y-4">
          {activity.input?.kind === "numeric_entry" && (
            <input 
              type="number" 
              className="w-full h-14 text-2xl font-bold text-center rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none" 
              placeholder="#"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={completed}
            />
          )}
          
          {(activity.input?.kind === "free_text" || activity.type === "reflection") && (
            <textarea 
              className="w-full h-32 p-4 text-lg rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none resize-none"
              placeholder="Type your answer here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={completed}
            />
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
             <div className="text-sm font-semibold text-slate-400">
               {completed ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Done</span> : "Ready?"}
             </div>
             <Button onClick={handleSubmit} disabled={completed || !input && activity.input} className={completed ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
               {completed ? "Completed" : "Check Answer"}
             </Button>
          </div>
        </div>

        {/* Hints */}
        {activity.hint_ladder?.length > 0 && !completed && (
           <div className="mt-6 pt-4 border-t border-slate-100">
              <details className="group">
                 <summary className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer list-none group-hover:text-indigo-500">
                    <Lightbulb className="w-4 h-4" /> Need a hint?
                 </summary>
                 <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    {activity.hint_ladder[0]}
                 </div>
              </details>
           </div>
        )}
      </div>
    </div>
  );
}

export default function LessonClient({ lessonId }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const rewards = useRewards();
  
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // New state for rich activities
  const [activityProgress, setActivityProgress] = useState({});
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const activeChildId = useMemo(() => getCookie(ACTIVE_CHILD_COOKIE), []);
  const economy = useEconomy(activeChildId);

  // Telemetry session
  const sessionRef = useRef(null);
  if (!sessionRef.current) sessionRef.current = lessonTelemetry.startSession({ lessonId, childId: activeChildId });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const id = decodeURIComponent(lessonId);
        
        const { data, error: e } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (cancelled) return;

        if (!data || e) {
           console.warn("Lesson not found:", id, e);
           setLesson({ id, title: "Lesson Not Found" });
           setContent(null);
        } else {
           setLesson(data);
           const c = data.content_json || data.content || data.lesson_json || {};
           setContent(typeof c === "string" ? JSON.parse(c) : c);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId, supabase]);

  // Extract Activities & Media
  const activities = useMemo(() => content?.activities || [], [content]);
  
  // Backwards compatibility for old quiz format
  const quizQuestions = useMemo(() => {
     if (activities.length > 0) return []; // Prefer new activities
     const q = content?.quiz;
     if (Array.isArray(q)) return q;
     if (content?.quiz?.questions && Array.isArray(content.quiz.questions)) return content.quiz.questions;
     return [];
  }, [content, activities]);

  // Create a map of media assets for easy lookup by ID
  const mediaMap = useMemo(() => {
     const assets = content?.media?.assets || [];
     const map = {};
     assets.forEach(a => { map[a.asset_id] = a; });
     // Handle new manifest format with 'variants'
     return map;
  }, [content]);

  // Cover Image
  const coverImage = useMemo(() => {
     const cover = content?.media?.cover;
     if (cover) return cover.variants?.[0]?.public_url || cover.public_url;
     // Fallback to first hero asset
     const assets = content?.media?.assets || [];
     const hero = assets.find(a => a.purpose === "hero_scene");
     return hero?.variants?.[0]?.public_url || hero?.public_url;
  }, [content]);

  function handleActivityInteract(index, data) {
    setActivityProgress(prev => ({ ...prev, [index]: data }));
  }

  async function handleComplete() {
    setSaving(true);
    try {
      // Calculate simple completion score
      const totalActs = activities.length || quizQuestions.length;
      const completedActs = Object.keys(activityProgress).length; 
      
      const accuracy = totalActs > 0 ? (completedActs / totalActs) : 1;
      
      sessionRef.current?.finalize({ accuracy });

      if (activeChildId) {
        // 1. Record Progress
        await supabase.from("lesson_progress").upsert({
            child_id: activeChildId,
            lesson_id: decodeURIComponent(lessonId),
            status: "completed",
            attempts: 1,
            mastery_score: accuracy,
            updated_at: new Date().toISOString(),
        });

        // 2. Economy Rewards
        const COINS = 20;
        const XP = 30;
        try {
            await economy?.award?.(COINS, XP);
            rewards?.push?.({
               title: "Lesson complete!",
               message: `+${COINS} coins • +${XP} XP`,
               tone: "levelup",
            });
        } catch {}

        // 3. Stickers
        try {
            addSeasonXp(Math.round(15));
            unlockSticker(`lesson:${String(lesson?.id || lessonId)}`);
        } catch {}
      }

      setCelebrate(true);
      playUISound("success");
      haptic?.("success");
      
      setTimeout(() => router.back(), 2000);
    } catch (e) {
      console.error(e);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center pt-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status" />
        <div className="mt-4 font-bold text-slate-500">Opening Lesson...</div>
      </div>
    );
  }

  const title = safeText(lesson?.title || `Lesson ${lessonId}`);
  const overview = safeText(content?.objective || content?.learning_goal || content?.overview || "Lesson overview");
  const explanation = safeText(content?.explanation);
  const strategies = content?.memory_strategies || [];
  const realWorld = safeText(content?.real_world_application || content?.realWorld);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-40">
      <ConfettiBurst show={celebrate} onDone={() => setCelebrate(false)} />

      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
         {coverImage && (
           <div className="absolute inset-0 opacity-60">
             <Image src={coverImage} alt="Lesson Cover" fill className="object-cover" />
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
         
         <div className="relative z-10 p-8 sm:p-12 text-white">
            <Button variant="outline" onClick={() => router.back()} className="mb-6 bg-white/20 border-transparent text-white hover:bg-white/30 backdrop-blur-md">
               Close
            </Button>
            
            <div className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-2">
               Lesson
            </div>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 text-white drop-shadow-lg">
               {title}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-200 max-w-2xl leading-relaxed">
               {overview}
            </p>
         </div>
      </div>

      <CoachBanner signals={null} />

      {/* 1. Deep Dive */}
      {(explanation) && (
        <Card className="p-8 border-l-8 border-l-indigo-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">The Big Idea</h2>
            </div>
            <RichText text={explanation} />
        </Card>
      )}

      {/* 2. Strategies & Real World */}
      <div className="grid md:grid-cols-2 gap-6">
         {strategies.length > 0 && (
           <Card className="p-8 bg-amber-50 border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Memory Tips</h2>
              </div>
              <ul className="space-y-4">
                 {strategies.map((s, i) => (
                   <li key={i} className="flex gap-3 font-medium text-slate-800">
                      <span className="font-black text-amber-500">{i+1}.</span>
                      {s}
                   </li>
                 ))}
              </ul>
           </Card>
         )}

         {realWorld && (
           <Card className="p-8 bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">In Real Life</h2>
              </div>
              <p className="font-medium text-slate-800 leading-relaxed">
                 {realWorld}
              </p>
           </Card>
         )}
      </div>

      {/* 3. NEW: Rich Activities Loop */}
      {activities.length > 0 && (
         <div className="space-y-8">
            <div className="flex items-center gap-3 mt-8 mb-4 px-2">
               <BrainCircuit className="w-6 h-6 text-slate-400" />
               <h2 className="text-2xl font-black text-slate-900">Your Mission</h2>
            </div>

            {activities.map((act, i) => (
               <ActivityItem 
                 key={i} 
                 index={i} 
                 activity={act} 
                 mediaMap={mediaMap} 
                 onInteract={handleActivityInteract} 
               />
            ))}
         </div>
      )}

      {/* Legacy Quiz Loop (Fallback) */}
      {quizQuestions.length > 0 && activities.length === 0 && (
         <div className="text-center p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="font-bold text-slate-500">Legacy Quiz Mode</h3>
            <p className="text-sm text-slate-400">This lesson uses an older format. Please regenerate it for the full experience.</p>
         </div>
      )}

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                <div className="text-sm font-black text-slate-900">
                  {Object.keys(activityProgress).length} / {activities.length || quizQuestions.length} Steps
                </div>
             </div>
             <Button onClick={handleComplete} disabled={saving} className="w-full sm:w-auto shadow-xl bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 text-lg rounded-full">
                {saving ? "Saving..." : "Finish Lesson"}
             </Button>
        </div>
      </div>

    </div>
  );
}