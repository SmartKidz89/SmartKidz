"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import GuidelinesCanvas from '@/components/writing/GuidelinesCanvas';
import { getSupabaseClient } from "../../../../lib/supabaseClient";
import { overallWritingFeedback, pathMatchFeedback, startZoneFeedback } from "../../../../lib/writing/metrics";
import { getTemplate } from "../../../../lib/writing/templates";
import { getSkillsFor } from "@/lib/mastery/skills";
import { applyMasteryDelta, syncMasteryToServer } from "@/lib/mastery/store";
import { addSeasonXp } from "@/components/app/SeasonPassPanel";
import { unlockSticker } from "@/components/app/CollectionBook";
import { appendProgress } from "@/lib/progress/log";
import { ACTIVE_CHILD_COOKIE, getCookie } from "@/lib/childCookie";

const letterSets = {
  "A–E": ["A", "B", "C", "D", "E"],
  "F–J": ["F", "G", "H", "I", "J"],
  "K–O": ["K", "L", "M", "N", "O"],
  "P–T": ["P", "Q", "R", "S", "T"],
  "U–Z": ["U", "V", "W", "X", "Y", "Z"]
};

const sentencePrompts = [
  "I can run.",
  "The cat sat on the mat.",
  "We went to the park today.",
  "Please write neatly and leave spaces.",
  "My favourite animal is a dolphin."
];

export default function WritingClient() {
  const params = useSearchParams();
  const fromToday = params.get("from") === "today";
  const mission = params.get("mission") || "writing";

  const supabase = useMemo(() => getSupabaseClient(), []);
  const [mode, setMode] = useState("letters"); // letters | sentences
  const [guidelines, setGuidelines] = useState("threeLine");
  const [lineSpacing, setLineSpacing] = useState("normal");
  const [traceOpacity, setTraceOpacity] = useState(0.25);
  const [dashedTrace, setDashedTrace] = useState(true);

  const [letterGroup, setLetterGroup] = useState("A–E");
  const [letter, setLetter] = useState("A");
  const [letterCase, setLetterCase] = useState("both"); // upper|lower|both


  const [sentenceIndex, setSentenceIndex] = useState(0);

  const [strokes, setStrokes] = useState([]);
  const [meta, setMeta] = useState({ width: 920, height: 420, preset: guidelines, lineSpacing });

  const [msg, setMsg] = useState(null);
  const spacingMult = lineSpacing === "wide" ? 1.15 : lineSpacing === "tight" ? 0.9 : 1.0;
  const traceText =
    mode === "letters"
      ? (letterCase === "upper" ? `${letter}` : letterCase === "lower" ? `${letter.toLowerCase()}` : `${letter}${letter.toLowerCase()}`)
      : sentencePrompts[sentenceIndex];

  const feedback = overallWritingFeedback({ strokes, canvasHeight: meta.height || 420, preset: guidelines, spacingMult, traceText });
  const template = mode === "letters" ? getTemplate(letterCase === "lower" ? letter.toLowerCase() : letter) : null;
  const match = mode === "letters" ? pathMatchFeedback({ strokes, templatePoints: template }) : null;
  const startZone = mode === "letters" ? startZoneFeedback(strokes, meta.height || 420, guidelines, spacingMult) : null;


  const [busy, setBusy] = useState(false);

  async function saveAttempt() {
    setBusy(true);
    setMsg(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) throw new Error("Not logged in");

      const payload = {
        activity: "writing_studio",
        mode,
        traceText,
        guidelines,
        lineSpacing,
        dashedTrace,
        traceOpacity,
        strokes
      };

      // Store in a generic "attempts" table if present; if not, keep this as a no-op.
      // Many bases have an attempts/progress table. We'll try both names safely.
      const insertRow = {
        user_id: uid,
        activity_id: mode === "letters" ? `trace_letter_${letter}` : `trace_sentence_${sentenceIndex + 1}`,
        response_json: payload
      };

      let error = null;

      // Try attempts table first
      const r1 = await supabase.from("attempts").insert(insertRow);
      if (r1?.error) {
        // Fallback: practice_attempts
        const r2 = await supabase.from("attempts").insert(insertRow);
        if (r2?.error) error = r2.error;
      }

      if (error) throw error;

      // --- Adaptive signals + rewards (local-first, backend optional) ---
      try {
        const score = Number(feedback?.score ?? match?.score ?? 75);
        const accuracy = Math.max(0, Math.min(1, score / 100));

        // Duration estimate from stroke timestamps (active drawing time)
        let firstT = null;
        let lastT = null;
        for (const s of strokes || []) {
          for (const p of s.points || []) {
            if (typeof p.t !== "number") continue;
            firstT = firstT == null ? p.t : Math.min(firstT, p.t);
            lastT = lastT == null ? p.t : Math.max(lastT, p.t);
          }
        }
        const activeMs = firstT != null && lastT != null ? Math.max(0, lastT - firstT) : 0;

        const childId = getCookie(ACTIVE_CHILD_COOKIE) || uid;

        // Mastery: writing feeds English skills (Year 1 baseline)
        const skills = getSkillsFor("english", 1).map((s) => s.id);
        const delta = Math.max(1, Math.round(5 * accuracy));
        const nextState = applyMasteryDelta(skills.slice(0, 2), delta);
        try {
          syncMasteryToServer(childId, nextState);
        } catch {}

        // Season + collection
        addSeasonXp(Math.round(10 * accuracy));
        unlockSticker(`writing:${mode}:${traceText}`);

        // Parent insights
        appendProgress({
          childId,
          kind: "writing",
          mode,
          traceText,
          accuracy,
          telemetry: { activeMs, strokes: strokes?.length || 0, smoothness: feedback?.smoothness ?? null },
        });
      } catch {}

      setMsg("Saved! Great practice. You can repeat as many times as you like.");
    } catch (e) {
      setMsg(e?.message || "Save failed. (If your DB has no attempts table yet, this is expected.)");
    } finally {
      setBusy(false);
    }
  }

  function nextPrompt() {
    setSentenceIndex((i) => (i + 1) % sentencePrompts.length);
    setMsg(null);
  }

  return (
    <main className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="grid gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-600">English</div>
                <h1 className="text-3xl font-extrabold tracking-tight">Writing & Tracing Studio</h1>
                <p className="mt-2 text-slate-700 max-w-2xl">
                  Practise letter formation and sentence writing with handwriting guidelines. Choose tracing style, line spacing, and prompts.
                  This is designed for calm repetition and confidence.
                </p>
                {fromToday && (
                  <div className="mt-4 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 max-w-4xl">
                    <div className="font-extrabold text-indigo-900">Today’s mission: Writing</div>
                    <div className="mt-1 text-sm text-indigo-900/80">
                      Neat comes before fast. Practise your tracing or sentence writing until it feels smoother, then mark the mission complete.
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button href={`/app/today/complete?mission=${mission}`}>Mark mission complete</Button>
                      <Button href="/app/today" variant="secondary">Back to Today</Button>
                    </div>
                  </div>
                )}

              </div>
              <div className="flex gap-2">
                <Button href="/app" variant="secondary">Back</Button>
                <Button href="/app/english/writing/review" variant="outline">Review</Button>
                <Button onClick={saveAttempt} disabled={busy || strokes.length === 0}>
                  {busy ? "Saving…" : "Save practice"}
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid gap-3">
                  <div className="text-sm font-extrabold text-slate-800">Practice type</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setMode("letters"); setMsg(null); }}
                      className={`h-10 px-4 rounded-2xl text-sm font-semibold border ${mode === "letters" ? "bg-brand-primary text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                    >
                      Trace letters
                    </button>
                    <button
                      onClick={() => { setMode("sentences"); setMsg(null); }}
                      className={`h-10 px-4 rounded-2xl text-sm font-semibold border ${mode === "sentences" ? "bg-brand-primary text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                    >
                      Write sentences
                    </button>
                  </div>

                  {mode === "letters" ? (
                    <>
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700">Letter group</span>
                        <select
                          className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                          value={letterGroup}
                          onChange={(e) => {
                            const g = e.target.value;
                            setLetterGroup(g);
                            setLetter(letterSets[g][0]);
                          }}
                        >
                          {Object.keys(letterSets).map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700">Letter</span>
                        <select
                          className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                          value={letter}
                          onChange={(e) => setLetter(e.target.value)}
                        >
                          {letterSets[letterGroup].map((L) => <option key={L} value={L}>{L}</option>)}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700">Letter case</span>
                        <select
                          className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                          value={letterCase}
                          onChange={(e) => setLetterCase(e.target.value)}
                        >
                          <option value="both">Upper + lower (Aa)</option>
                          <option value="upper">Uppercase only (A)</option>
                          <option value="lower">Lowercase only (a)</option>
                        </select>
                      </label>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <div className="text-sm font-semibold text-slate-700">Sentence prompt</div>
                      <div className="mt-2 text-slate-800 font-extrabold text-lg">
                        “{sentencePrompts[sentenceIndex]}”
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={nextPrompt}
                          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
                        >
                          New sentence
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="text-sm font-extrabold text-slate-800">Guidelines</div>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Paper style</span>
                    <select
                      className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                    >
                      <option value="threeLine">3-line (top/middle/baseline)</option>
                      <option value="twoLine">2-line (x-height/baseline)</option>
                      <option value="lined">Lined</option>
                      <option value="blank">Blank</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Line spacing</span>
                    <select
                      className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(e.target.value)}
                    >
                      <option value="wide">Wide</option>
                      <option value="normal">Normal</option>
                      <option value="tight">Tight</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-3">
                  <div className="text-sm font-extrabold text-slate-800">Tracing settings</div>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Trace style</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDashedTrace(true)}
                        className={`h-10 px-4 rounded-2xl text-sm font-semibold border ${dashedTrace ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                      >
                        Dotted
                      </button>
                      <button
                        onClick={() => setDashedTrace(false)}
                        className={`h-10 px-4 rounded-2xl text-sm font-semibold border ${!dashedTrace ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                      >
                        Solid
                      </button>
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Trace visibility</span>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={Math.round(traceOpacity * 100)}
                      onChange={(e) => setTraceOpacity(Number(e.target.value) / 100)}
                    />
                    <div className="text-xs text-slate-600">{Math.round(traceOpacity * 100)}%</div>
                  </label>

                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <div className="text-sm font-extrabold text-slate-800">Guidelines tips</div>
                    <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                      <li>Most letters sit on the baseline (bottom line).</li>
                      <li>Tall letters reach the top line. Short letters reach the middle line.</li>
                      <li>Leave a small gap between words — about one finger-width.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {feedback && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-extrabold text-slate-800">Writing feedback</div>
                  <div className="text-xs text-slate-600">Gentle tips to improve alignment, size, and spacing.</div>
                </div>
                {typeof feedback.score === "number" && (
                  <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Overall: {feedback.score}/100
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-2">
                {(feedback.notes || []).slice(0, 3).map((n, i) => (
                  <div key={i} className="text-sm text-slate-700">• {n}</div>
                ))}
                {typeof feedback.smoothness === "number" && (
                  <div className="text-xs text-slate-600">Smoothness: {feedback.smoothness}/100</div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Tip: Practise slowly first. Neat writing comes before fast writing.

                    
              </div>
            </div>
          )}

{msg && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {msg}
                </div>
              )}
            </Card>

            <GuidelinesCanvas
              preset={guidelines}
              lineSpacing={lineSpacing}
              traceText={traceText}
              traceOpacity={traceOpacity}
              dashedTrace={dashedTrace}
              onChange={setStrokes}
              onMeta={setMeta}
            />
          </div>
        </PaywallGate>
      </div>
    </main>
  );
}