"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  return null;
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
  const [showHints, setShowHints] = useState({});
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const activeChildId = useMemo(() => getCookie(ACTIVE_CHILD_COOKIE), []);
  const economy = useEconomy(activeChildId);

  // Rare encouragement moments (max once per day) — best effort.
  try {
    if (activeChildId) useEncouragement({ childId: activeChildId, childName: null });
  } catch {}

  // Telemetry session
  const sessionRef = useRef(null);
  if (!sessionRef.current) sessionRef.current = lessonTelemetry.startSession({ lessonId, childId: activeChildId });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Demo mode: lessons can be seeded in local storage via demo supabase facade.
        const { data, error: e } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
        if (e) throw e;
        if (!data) throw new Error("Lesson not found.");
        if (cancelled) return;
        setLesson(data);
        const c = data.content_json || data.content || data.lesson_json || {};
        setContent(typeof c === "string" ? JSON.parse(c) : c);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load lesson.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lessonId, supabase]);

  function handleSelectOption(qIdx, optIdx) {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowQuizFeedback((prev) => ({ ...prev, [qIdx]: true }));

    // Telemetry
    try {
      const q = content?.quiz?.questions?.[qIdx];
      const correctIdx = getCorrectIndex(q);
      const isCorrect = correctIdx == null ? null : optIdx === correctIdx;
      sessionRef.current?.recordAttempt({
        qKey: `quiz:${qIdx}`,
        type: "mcq",
        correct: isCorrect,
      });
    } catch {}

    try {
      playUISound("tap");
      haptic?.("light");
    } catch {}
  }

  function handleFreeformChange(qIdx, value) {
    setAnswers((prev) => ({ ...prev, [qIdx]: value }));
    try {
      sessionRef.current?.recordView({ qKey: `quiz:${qIdx}`, type: "freeform" });
    } catch {}
  }

  function computeQuizScore() {
    const qs = Array.isArray(content?.quiz?.questions) ? content.quiz.questions.slice(0, 5) : [];
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
      if (!activeChildId) throw new Error("No active child selected.");

      const { accuracy, correct, totalKeyed } = computeQuizScore();
      const telem = sessionRef.current?.finalize({ accuracy });

      // Persist lesson progress (best effort)
      try {
        await supabase.rpc("upsert_lesson_progress", {
          p_child_id: activeChildId,
          p_lesson_id: lessonId,
          p_status: "completed",
          p_attempt_delta: 1,
          p_mastery_score: Math.max(0, Math.min(1, accuracy)),
        });
      } catch {
        // fallback table upsert (best effort)
        try {
          await supabase.from("lesson_progress").upsert({
            child_id: activeChildId,
            lesson_id: lessonId,
            status: "completed",
            attempts: 1,
            mastery_score: Math.max(0, Math.min(1, accuracy)),
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      // Economy rewards
      const COINS = 12;
      const XP = 18;
      try {
        await economy?.award?.({ coins: COINS, xp: XP });
      } catch {}

      // Mastery weighting: scale delta by accuracy and time-on-task (softly)
      try {
        const subject = String(lesson?.subject_id || lesson?.subject || "maths");
        const yearLevel = Number(lesson?.year_level || lesson?.yearLevel || 1);
        const skills = getSkillsFor(subject, yearLevel).map((s) => s.id);
        const timeFactor = telem?.summary?.activeMs
          ? Math.max(0.85, Math.min(1.15, telem.summary.activeMs / (60_000))) // ~1 minute baseline
          : 1;
        const delta = Math.round(6 * accuracy * timeFactor);
        const nextState = applyMasteryDelta(skills.slice(0, 3), Math.max(1, delta));
        try {
          syncMasteryToServer(activeChildId, nextState);
        } catch {}
      } catch {}

      // Season + stickers
      try {
        addSeasonXp(Math.round(12 * accuracy));
        unlockSticker(`lesson:${String(lesson?.id || lessonId)}`);
      } catch {}

      // Always-available local progress log for parent insights
      try {
        appendProgress({
          childId: activeChildId,
          kind: "lesson",
          lessonId,
          title: lesson?.title || lesson?.name || null,
          subject: lesson?.subject || lesson?.subject_code || null,
          coins: COINS,
          xp: XP,
          quiz: { correct, total: totalKeyed, accuracy },
          telemetry: telem?.summary || null,
        });
      } catch {}

      // Reward UI
      try {
        rewards?.push?.({
          title: "Lesson complete!",
          message: `+${COINS} coins • +${XP} XP`,
          tone: accuracy >= 0.8 ? "levelup" : "success",
          meta: totalKeyed ? `${correct}/${totalKeyed} correct` : undefined,
        });
      } catch {}

      setCelebrate(true);
      try {
        playUISound("success");
        haptic?.("success");
      } catch {}
      setTimeout(() => router.back(), 900);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Could not mark lesson complete.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8">Loading lesson…</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="font-extrabold text-xl">Couldn’t load lesson</div>
          <div className="mt-2 text-slate-600">{error}</div>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.back()} variant="outline">Back</Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const title = safeText(lesson?.title || lesson?.name || `Lesson ${lessonId}`);
  const overview =
    safeText(content?.learning_goal) ||
    safeText(content?.hook) ||
    safeText(content?.overview) ||
    "Lesson overview";

  const quizQuestions = Array.isArray(content?.quiz?.questions) ? content.quiz.questions.slice(0, 5) : [];

  // Live coaching signals while the learner is in-session.
  const liveSignals = useMemo(() => {
    try {
      const { accuracy } = computeQuizScore();
      const s = sessionRef.current?.summary?.() || null;
      return deriveLearningSignals({ accuracy, summary: s || {} });
    } catch {
      return null;
    }
  }, [answers, content]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ConfettiBurst show={celebrate} onDone={() => setCelebrate(false)} />

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold">{title}</div>
            <div className="mt-2 text-slate-700">{overview}</div>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </Card>

      <CoachBanner signals={liveSignals} />

      <CoachBanner signals={coaching} />

      {safeText(content?.body) && (
        <Card className="p-8 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: safeText(content.body) }} />
        </Card>
      )}

      {quizQuestions.length > 0 && (
        <Card className="p-8">
          <h2 className="text-2xl font-extrabold mb-4">Quick quiz</h2>
          <div className="space-y-4">
            {quizQuestions.map((q, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                <div className="font-bold">{safeText(q.q) || `Question ${i + 1}`}</div>

                {isMultiChoice(q) ? (
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, j) => {
                      const selected = answers[i] === j;
                      const correctIndex = getCorrectIndex(q);
                      const show = !!showQuizFeedback[i];
                      const isCorrect = show && correctIndex != null && j === correctIndex;
                      const isWrong = show && selected && correctIndex != null && j !== correctIndex;
                      const tone = isCorrect ? "secondary" : isWrong ? "outline" : selected ? "secondary" : "ghost";
                      return (
                        <Button
                          key={j}
                          variant={tone}
                          className={`justify-start text-left w-full rounded-2xl px-4 py-3 ${
                            isCorrect ? "border border-emerald-300" : isWrong ? "border border-rose-300" : ""
                          }`}
                          onClick={() => handleSelectOption(i, j)}
                        >
                          <span className="font-semibold">{String.fromCharCode(65 + j)}.</span>
                          <span className="ml-2">{safeText(opt)}</span>
                        </Button>
                      );
                    })}

                    {showQuizFeedback[i] && (
                      <div className="mt-2 text-sm">
                        {(() => {
                          const correctIndex = getCorrectIndex(q);
                          if (correctIndex == null) {
                            return <div className="text-slate-600">Nice choice. (No answer key provided.)</div>;
                          }
                          return answers[i] === correctIndex ? (
                            <div className="text-emerald-700 font-semibold">Correct!</div>
                          ) : (
                            <div className="text-rose-700 font-semibold">
                              Not quite. Correct answer: {String.fromCharCode(65 + correctIndex)}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {safeText(q.hint) && (
                      <div className="mt-3">
                        {!showHints[i] ? (
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => {
                              setShowHints((p) => ({ ...p, [i]: true }));
                              try {
                                sessionRef.current?.recordHint({ qKey: `quiz:${i}`, type: "quiz" });
                              } catch {}
                              try { playUISound("tap"); } catch {}
                            }}
                          >
                            Show hint
                          </Button>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700">
                            <span className="font-semibold">Hint:</span> {safeText(q.hint)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3">
                    <textarea
                      className="w-full rounded-2xl border border-slate-200 p-3 bg-white"
                      rows={3}
                      value={safeText(answers[i] || "")}
                      onChange={(e) => handleFreeformChange(i, e.target.value)}
                      placeholder="Type your answer…"
                    />
                    <div className="mt-2 text-xs text-slate-500">Tip: write your best answer, then press Complete.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <CoachBanner signals={liveSignals} />

      <Card className="p-6 flex items-center justify-between">
        <div className="text-slate-700">
          Finish the lesson to earn rewards and update your progress.
        </div>
        <Button onClick={handleComplete} disabled={saving} className="skz-pressable">
          {saving ? "Saving…" : "Complete lesson"}
        </Button>
      </Card>

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
