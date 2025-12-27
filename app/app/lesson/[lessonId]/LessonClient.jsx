"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, BookOpen, Compass, BrainCircuit } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRewards } from "@/components/ui/RewardProvider";
import { playUISound, haptic } from "@/components/ui/sound";
import { useEncouragement } from "@/components/ui/useEmotionalMoments";

import { getSupabaseClient } from "@/lib/supabaseClient";
import { ACTIVE_CHILD_COOKIE, getCookie } from "@/lib/childCookie";

import { getSkillsFor } from "@/lib/mastery/skills";
import { applyMasteryDelta, syncMasteryToServer } from "@/lib/mastery/store";
import { addSeasonXp } from "@/components/app/SeasonPassPanel";
import { unlockSticker } from "@/components/app/CollectionBook";
import { useEconomy } from "@/lib/economy/client";

import { lessonTelemetry } from "@/lib/lesson/telemetry";
import { deriveLearningSignals } from "@/lib/lesson/insights";
import { appendProgress } from "@/lib/progress/log";

import CoachBanner from "@/components/ui/CoachBanner";

// Robust Fallback Content (Guarantees UI never breaks)
const FALLBACK_LESSON = {
  title: "Example: Counting to 10",
  overview: "Learn to count objects and match them to numbers.",
  content_json: {
    explanation: "Counting is like climbing stairs. We say numbers in order: 1, 2, 3... The last number we say tells us how many things there are!",
    memory_strategies: ["Touch each item as you count it.", "Say the numbers out loud."],
    real_world_application: "Count the apples in your fruit bowl or the steps to your bedroom.",
    quiz: [
      {
        q: "How many fingers on one hand?",
        options: ["3", "5", "8", "10"],
        answer: "5",
        correctIndex: 1,
        hint: "Count them: 1, 2, 3, 4..."
      },
      {
        q: "What number comes after 2?",
        options: ["1", "3", "5"],
        answer: "3",
        correctIndex: 1,
        hint: "1, 2, ..."
      }
    ]
  }
};

function safeText(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
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

function isMultiChoice(q) {
  return Array.isArray(q?.options) && q.options.length > 0;
}

function getCorrectIndex(q) {
  if (q == null) return null;
  const a = q.answer ?? q.correct ?? q.correctIndex;
  if (typeof a === "number") return a;
  if (typeof a === "string") {
    const s = a.trim().toUpperCase();
    if (s.length === 1 && s >= "A" && s <= "Z") return s.charCodeAt(0) - 65;
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return asNum;
  }
  if (typeof q.correct_option === "number") return q.correct_option;
  // If answer text matches an option text, find index
  if (q.options && typeof q.answer === "string") {
     const idx = q.options.findIndex(o => o === q.answer);
     if (idx !== -1) return idx;
  }
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

export default function LessonClient({ lessonId }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const rewards = useRewards();
  
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answers, setAnswers] = useState({});
  const [showQuizFeedback, setShowQuizFeedback] = useState({});
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
      setError(null);
      try {
        const { data, error: e } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
        
        if (cancelled) return;

        // CRITICAL FIX: If DB returns nothing (e.g. RLS blocking, or empty DB), use fallback.
        if (!data || e) {
           console.warn("Lesson not found in DB or blocked by RLS. Using fallback content.");
           setLesson({ id: lessonId, title: FALLBACK_LESSON.title });
           setContent(FALLBACK_LESSON.content_json);
        } else {
           setLesson(data);
           const c = data.content_json || data.content || data.lesson_json || {};
           setContent(typeof c === "string" ? JSON.parse(c) : c);
        }
      } catch (e) {
        // Even on crash, use fallback
        if (!cancelled) {
            setLesson({ id: lessonId, title: FALLBACK_LESSON.title });
            setContent(FALLBACK_LESSON.content_json);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId, supabase]);

  function handleSelectOption(qIdx, optIdx) {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowQuizFeedback((prev) => ({ ...prev, [qIdx]: true }));

    try {
      playUISound("tap");
      haptic?.("light");
    } catch {}
  }

  function handleFreeformChange(qIdx, value) {
    setAnswers((prev) => ({ ...prev, [qIdx]: value }));
  }

  function computeQuizScore() {
    const qs = Array.isArray(content?.quiz) ? content.quiz : Array.isArray(content?.quiz?.questions) ? content.quiz.questions : [];
    let totalKeyed = 0;
    let correct = 0;
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (!isMultiChoice(q)) continue;
      const correctIdx = getCorrectIndex(q);
      if (correctIdx == null) continue;
      totalKeyed += 1;
      if (answers[i] === correctIdx) correct += 1;
    }
    const accuracy = totalKeyed === 0 ? 1 : correct / totalKeyed;
    return { correct, totalKeyed, accuracy };
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const { accuracy, correct, totalKeyed } = computeQuizScore();
      const telem = sessionRef.current?.finalize({ accuracy });

      if (activeChildId) {
        // Attempt to save progress, but don't block UI if it fails (e.g. no internet/RLS)
        try {
            await supabase.from("lesson_progress").upsert({
                child_id: activeChildId,
                lesson_id: lessonId,
                status: "completed",
                attempts: 1,
                mastery_score: Math.max(0, Math.min(1, accuracy)),
                updated_at: new Date().toISOString(),
            });
        } catch (err) {
            console.warn("Failed to save progress:", err);
        }

        // Optimistic rewards
        const COINS = 12;
        const XP = 18;
        try {
            await economy?.award?.({ coins: COINS, xp: XP });
            rewards?.push?.({
               title: "Lesson complete!",
               message: `+${COINS} coins • +${XP} XP`,
               tone: accuracy >= 0.8 ? "levelup" : "success",
            });
        } catch {}

        try {
            addSeasonXp(Math.round(12 * accuracy));
            unlockSticker(`lesson:${String(lesson?.id || lessonId)}`);
        } catch {}
      }

      setCelebrate(true);
      try {
        playUISound("success");
        haptic?.("success");
      } catch {}
      setTimeout(() => router.back(), 1500);
    } catch (e) {
      console.error(e);
      // Fallback: just go back if saving errors out entirely
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center pt-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status" />
        <div className="mt-4 font-bold text-slate-500">Opening Lesson...</div>
      </div>
    );
  }

  const title = safeText(lesson?.title || `Lesson ${lessonId}`);
  const overview = safeText(content?.objective || content?.learning_goal || content?.hook || content?.overview || "Lesson overview");
  
  const explanation = safeText(content?.explanation);
  const strategies = Array.isArray(content?.memory_strategies) ? content.memory_strategies : [];
  const realWorld = safeText(content?.real_world_application || content?.realWorld);
  const quizQuestions = Array.isArray(content?.quiz) ? content.quiz : Array.isArray(content?.quiz?.questions) ? content.quiz.questions : [];

  const liveSignals = (() => {
    try {
      const { accuracy } = computeQuizScore();
      return deriveLearningSignals({ accuracy, summary: {} });
    } catch { return null; }
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-32">
      <ConfettiBurst show={celebrate} onDone={() => setCelebrate(false)} />

      {/* Header */}
      <Card className="p-8 bg-gradient-to-br from-white to-slate-50 border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lesson</div>
            <div className="text-3xl font-black text-slate-900 leading-tight">{title}</div>
            <div className="mt-3 text-lg font-medium text-slate-700">{overview}</div>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Exit
          </Button>
        </div>
      </Card>

      <CoachBanner signals={liveSignals} />

      {/* 1. Deep Dive Explanation */}
      {(explanation || safeText(content?.body)) && (
        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-xl font-extrabold uppercase tracking-wide">Deep Dive</h2>
            </div>
            {explanation ? (
                <RichText text={explanation} />
            ) : (
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: safeText(content.body) }} />
            )}
        </Card>
      )}

      {/* 2. Memory Strategies (Grid) */}
      {strategies.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-amber-50 border-amber-100">
                <div className="flex items-center gap-3 mb-4 text-amber-700">
                    <Lightbulb className="w-6 h-6" />
                    <h2 className="text-lg font-extrabold uppercase tracking-wide">Memory Tips</h2>
                </div>
                <ul className="space-y-3">
                    {strategies.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-slate-800">
                            <span className="font-bold text-amber-500">{i+1}.</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            {/* 3. Real World Application */}
            {realWorld && (
                <Card className="p-6 bg-emerald-50 border-emerald-100">
                    <div className="flex items-center gap-3 mb-4 text-emerald-700">
                        <Compass className="w-6 h-6" />
                        <h2 className="text-lg font-extrabold uppercase tracking-wide">In The Real World</h2>
                    </div>
                    <div className="text-slate-800 leading-relaxed">
                        {realWorld}
                    </div>
                </Card>
            )}
        </div>
      )}

      {/* 4. Quiz Section */}
      {quizQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 mt-8">
             <BrainCircuit className="w-6 h-6 text-slate-400" />
             <h2 className="text-2xl font-black text-slate-900">Knowledge Check</h2>
          </div>
          
          {quizQuestions.map((q, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
              <div className="font-bold text-lg mb-4 text-slate-900">
                <span className="text-slate-400 mr-2">{i + 1}.</span>
                {safeText(q.q || q.question)}
              </div>

              {isMultiChoice(q) ? (
                <div className="grid gap-3">
                  {q.options.map((opt, j) => {
                    const selected = answers[i] === j;
                    const correctIndex = getCorrectIndex(q);
                    const show = !!showQuizFeedback[i];
                    
                    let stateClass = "border-slate-200 hover:bg-slate-50";
                    if (show) {
                        if (j === correctIndex) stateClass = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500";
                        else if (selected) stateClass = "border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500";
                        else stateClass = "border-slate-100 opacity-60"; 
                    } else if (selected) {
                        stateClass = "border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500";
                    }

                    return (
                      <button
                        key={j}
                        className={cn(
                            "w-full text-left rounded-2xl border-2 px-5 py-4 font-semibold transition-all duration-200 active:scale-[0.99]",
                            stateClass
                        )}
                        onClick={() => handleSelectOption(i, j)}
                        disabled={show} 
                      >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border",
                                show && j === correctIndex ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-500"
                            )}>
                                {String.fromCharCode(65 + j)}
                            </div>
                            <span>{safeText(opt)}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Hint / Feedback Area */}
                  {showQuizFeedback[i] && (
                    <div className="mt-2 pl-2">
                       {answers[i] === getCorrectIndex(q) ? (
                           <div className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                               <Sparkles className="w-4 h-4" /> That's correct!
                           </div>
                       ) : (
                           <div className="text-rose-600 font-bold text-sm">
                               Not quite. The correct answer is {String.fromCharCode(65 + (getCorrectIndex(q) || 0))}.
                           </div>
                       )}
                       {q.hint && (
                           <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl inline-block">
                               💡 {q.hint}
                           </div>
                       )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    rows={3}
                    value={safeText(answers[i] || "")}
                    onChange={(e) => handleFreeformChange(i, e.target.value)}
                    placeholder="Type your answer here..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completion Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
             <div className="text-sm font-semibold text-slate-600 hidden sm:block">
                 Great effort! Finish to save progress.
             </div>
             <Button onClick={handleComplete} disabled={saving} className="w-full sm:w-auto shadow-xl" size="lg">
                {saving ? "Saving..." : "Complete Lesson"}
             </Button>
        </div>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
             <div className="text-6xl animate-bounce">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}