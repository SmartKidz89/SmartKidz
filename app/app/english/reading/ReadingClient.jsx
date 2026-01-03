"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import PassageViewer from '@/components/reading/PassageViewer';
import ComprehensionQuiz from '@/components/reading/ComprehensionQuiz';
import { useTTS } from '@/components/reading/useTTS';
import { useRecorder } from '@/components/reading/useRecorder';
import { getSupabaseClient } from "../../../../lib/supabaseClient";
import library from "../../../../data/reading/library.json";
import { getSkillsFor } from "@/lib/mastery/skills";
import { applyMasteryDelta, syncMasteryToServer } from "@/lib/mastery/store";
import { addSeasonXp } from "@/components/app/SeasonPassPanel";
import { unlockSticker } from "@/components/app/CollectionBook";
import { appendProgress } from "@/lib/progress/log";
import { ACTIVE_CHILD_COOKIE, getCookie } from "@/lib/childCookie";

const bandLabels = { prep: "Prep", y1: "Year 1", y2: "Year 2", y3: "Year 3" };

export default function ReadingClient() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { ready, voices, speak, cancel } = useTTS();
  const rec = useRecorder();

  const params = useSearchParams();
  const fromToday = params.get("from") === "today";
  const mission = params.get("mission") || "reading";


  const [mode, setMode] = useState("readAlong"); // readAlong | echo | sight | comp
  const [band, setBand] = useState("prep");
  const [passageId, setPassageId] = useState(library.passages[0]?.id);

  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.9);

  const [highlight, setHighlight] = useState(null);
  const [echoIndex, setEchoIndex] = useState(0);
  const [retries, setRetries] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const passages = useMemo(() => library.passages.filter(p => p.band === band), [band]);
  const passage = useMemo(() => passages.find(p => p.id === passageId) || passages[0], [passages, passageId]);

  useEffect(() => {
    if (passages.length && !passages.find(p => p.id === passageId)) {
      setPassageId(passages[0].id);
    }
  }, [band, passages, passageId]);

  const sentences = useMemo(() => {
    const t = (passage?.text || "").replace(/\n/g, " ");
    return t.split(/(?<=[.!?])\s+/).filter(Boolean);
  }, [passage]);

  const sightWords = useMemo(() => library.sight_words?.[band] || [], [band]);

  function startSession() {
    setStartedAt(Date.now());
    setRetries(0);
    setConfidence(null);
    setMsg(null);
  }

  function stopSession() {
    setStartedAt(null);
    setHighlight(null);
    cancel();
  }

  function onWord(word) {
    if (!word) return;
    speak(word, { voiceURI, rate });
  }

  async function playAll() {
    startSession();
    setHighlight(0);

    // speak each sentence sequentially
    for (let i = 0; i < sentences.length; i++) {
      setHighlight(i);
      await new Promise((resolve) => {
        const u = speak(sentences[i], { voiceURI, rate });
        if (!u) return resolve();
        u.onend = resolve;
        u.onerror = resolve;
      });
    }
    setHighlight(null);
  }

  async function playSentence(i) {
    startSession();
    setHighlight(i);
    await new Promise((resolve) => {
      const u = speak(sentences[i], { voiceURI, rate });
      if (!u) return resolve();
      u.onend = resolve;
      u.onerror = resolve;
    });
    setHighlight(null);
  }

  async function echoPlayNext() {
    if (!sentences.length) return;
    startSession();
    const i = echoIndex % sentences.length;
    setHighlight(i);

    await new Promise((resolve) => {
      const u = speak(sentences[i], { voiceURI, rate });
      if (!u) return resolve();
      u.onend = resolve;
      u.onerror = resolve;
    });

    setMsg("Now you try. Tap Record and read the highlighted sentence.");
  }

  function echoAdvance() {
    setEchoIndex((x) => (x + 1) % Math.max(1, sentences.length));
    setHighlight(null);
    setMsg(null);
  }

  async function saveAttempt(extra = {}) {
    setSaving(true);
    setMsg(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) throw new Error("Not logged in");

      const durationMs = startedAt ? (Date.now() - startedAt) : 0;

      const payload = {
        feature: "reading_studio",
        mode,
        band,
        passage_id: passage?.id,
        title: passage?.title,
        theme: passage?.theme,
        retries,
        durationMs,
        confidence,
        recorder: { supported: rec.supported, durationMs: rec.durationMs, hasAudio: !!rec.audioURL },
        ...extra
      };

      const row = {
        user_id: uid,
        activity_id: `reading_${band}_${mode}_${passage?.id}`,
        response_json: payload
      };

      // Store in a generic "attempts" table if present; fall back to practice_attempts.
      let error = null;
      const r1 = await supabase.from("attempts").insert(row);
      if (r1?.error) {
        const r2 = await supabase.from("attempts").insert(row);
        if (r2?.error) error = r2.error;
      }
      if (error) throw error;

      // --- Adaptive signals + rewards (local-first, backend optional) ---
      try {
        const childId = getCookie(ACTIVE_CHILD_COOKIE) || uid;
        const yearLevel = band === "y3" ? 3 : band === "y2" ? 2 : 1;
        const comp = extra?.comprehension;
        const accuracy = comp?.total ? Math.max(0, Math.min(1, Number(comp.correct || 0) / Number(comp.total))) : 0.75;

        const skills = getSkillsFor("english", yearLevel).map((s) => s.id);
        const delta = Math.max(1, Math.round(5 * accuracy));
        const nextState = applyMasteryDelta(skills.slice(0, 2), delta);
        try { syncMasteryToServer(childId, nextState); } catch {}

        addSeasonXp(Math.round(10 * accuracy));
        unlockSticker(`reading:${band}:${mode}:${passage?.id}`);

        appendProgress({
          childId,
          kind: "reading",
          mode,
          band,
          passageId: passage?.id,
          title: passage?.title,
          accuracy,
          telemetry: { durationMs, retries, hasAudio: !!rec.audioURL, confidence },
          comprehension: comp || null,
        });
      } catch {}

      setMsg("Saved. Great job—short daily reading builds big confidence.");
    } catch (e) {
      setMsg(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="bg-gradient-to-br from-amber-50 via-white to-indigo-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-slate-600">English</div>
              <h1 className="text-3xl font-extrabold tracking-tight">Reading Studio (Prep–Year 3)</h1>
              <p className="mt-2 text-slate-700 max-w-3xl">
                Build real reading skill with a calm practice loop: listen, read along, echo read, practise sight words, then answer a few comprehension questions.
                Tap any word to hear it. Record your voice and listen back as many times as you like.
              </p>
            </div>
{fromToday && (
  <div className="mt-4 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 max-w-4xl">
    <div className="font-extrabold text-indigo-900">Today’s mission: Reading</div>
    <div className="mt-1 text-sm text-indigo-900/80">
      Practise until it feels smooth, then mark the mission complete. Retry is a strategy—go slow and steady.
    </div>
    <div className="mt-3 flex gap-2 flex-wrap">
      <Button href={`/app/today/complete?mission=${mission}`}>Mark mission complete</Button>
      <Button href="/app/today" variant="secondary">Back to Today</Button>
    </div>
  </div>
)}

            <div className="flex gap-2">
              <Button href="/app/english" variant="secondary">English Hub</Button>
              <Button onClick={() => saveAttempt()} disabled={saving}>
                {saving ? "Saving…" : "Save session"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <Card className="p-5">
              <div className="font-extrabold">Setup</div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Year band</span>
                  <select
                    className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={band}
                    onChange={(e) => setBand(e.target.value)}
                  >
                    {Object.keys(bandLabels).map((b) => (
                      <option key={b} value={b}>{bandLabels[b]}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Passage</span>
                  <select
                    className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={passageId}
                    onChange={(e) => setPassageId(e.target.value)}
                  >
                    {passages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} · {p.theme}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-semibold">Skills in this passage</div>
                  <div className="mt-1">Phonics: {(passage?.phonics_focus || []).join(", ") || "—"}</div>
                  <div className="mt-1">Sight words: {(passage?.sight_words || []).join(", ") || "—"}</div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-slate-700">Voiceover</div>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-slate-600">Voice</span>
                    <select
                      className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                      value={voiceURI}
                      onChange={(e) => setVoiceURI(e.target.value)}
                      disabled={!ready}
                    >
                      <option value="">Default voice</option>
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-slate-600">Speed</span>
                    <input
                      type="range"
                      min="0.75"
                      max="1.1"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                    <div className="text-xs text-slate-600">{rate.toFixed(2)}x</div>
                  </label>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-slate-700">Choose activity</div>
                  <div className="flex flex-wrap gap-2">
                    <Pill active={mode==="readAlong"} onClick={()=>setMode("readAlong")}>Read Along</Pill>
                    <Pill active={mode==="echo"} onClick={()=>setMode("echo")}>Echo Reading</Pill>
                    <Pill active={mode==="sight"} onClick={()=>setMode("sight")}>Sight Words</Pill>
                    <Pill active={mode==="comp"} onClick={()=>setMode("comp")}>Comprehension</Pill>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-slate-700">How did it feel?</div>
                  <div className="flex gap-2">
                    <Pill active={confidence==="easy"} onClick={()=>setConfidence("easy")}>😊 Easy</Pill>
                    <Pill active={confidence==="tricky"} onClick={()=>setConfidence("tricky")}>😐 Tricky</Pill>
                    <Pill active={confidence==="hard"} onClick={()=>setConfidence("hard")}>😕 Hard</Pill>
                  </div>
                </div>

                {msg && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    {msg}
                  </div>
                )}
              </div>
            </Card>

            <div className="grid gap-4">
              {mode === "readAlong" && (
                <div className="grid gap-4">
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-extrabold">Read Along</div>
                        <div className="text-sm text-slate-700">Tap a word to hear it. Use Play to listen sentence-by-sentence.</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button className="h-10 px-4 rounded-2xl bg-brand-primary text-white font-semibold" onClick={playAll}>
                          Play all
                        </button>
                        <button className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold" onClick={stopSession}>
                          Stop
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sentences.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => playSentence(i)}
                          className="h-9 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
                        >
                          Play sentence {i + 1}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <PassageViewer text={passage?.text} onWordClick={onWord} highlightSentenceIndex={highlight} />
                </div>
              )}

              {mode === "echo" && (
                <div className="grid gap-4">
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-extrabold">Echo Reading</div>
                        <div className="text-sm text-slate-700">Listen to one sentence, then record yourself reading it back.</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button className="h-10 px-4 rounded-2xl bg-brand-primary text-white font-semibold" onClick={echoPlayNext}>
                          Play next
                        </button>
                        <button
                          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold"
                          onClick={() => { setRetries(r => r + 1); setMsg("Try again—slow and smooth."); }}
                        >
                          Retry counter +1
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div className="text-sm font-semibold text-slate-700">Record your voice</div>
                      {!rec.supported && (
                        <div className="text-sm text-slate-700">
                          Recording is not supported on this device/browser.
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap items-center">
                        <button
                          onClick={rec.start}
                          disabled={!rec.supported || rec.recording}
                          className="h-10 px-4 rounded-2xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
                        >
                          {rec.recording ? "Recording…" : "Record"}
                        </button>
                        <button
                          onClick={rec.stop}
                          disabled={!rec.recording}
                          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold disabled:opacity-50"
                        >
                          Stop
                        </button>
                        <button
                          onClick={echoAdvance}
                          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold"
                        >
                          Next sentence
                        </button>
                      </div>

                      {rec.audioURL && (
                        <div className="mt-2">
                          <audio controls src={rec.audioURL} />
                          <div className="text-xs text-slate-600 mt-1">Recorded: {(rec.durationMs/1000).toFixed(1)}s</div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <PassageViewer text={passage?.text} onWordClick={onWord} highlightSentenceIndex={highlight} />
                </div>
              )}

              {mode === "sight" && (
                <Card className="p-6">
                  <div className="font-extrabold">Sight Words</div>
                  <p className="mt-2 text-slate-700">
                    Tap a word to hear it. Then read it aloud and record yourself.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {sightWords.map((w) => (
                      <button
                        key={w}
                        onClick={() => speak(w, { voiceURI, rate })}
                        className="h-11 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-yellow-50 font-extrabold"
                      >
                        {w}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-700">Record your voice</div>
                    <div className="mt-2 flex gap-2 flex-wrap items-center">
                      <button
                        onClick={rec.start}
                        disabled={!rec.supported || rec.recording}
                        className="h-10 px-4 rounded-2xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
                      >
                        {rec.recording ? "Recording…" : "Record"}
                      </button>
                      <button
                        onClick={rec.stop}
                        disabled={!rec.recording}
                        className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold disabled:opacity-50"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => { setRetries(r => r + 1); setMsg("Nice—repeat tricky words a few times."); }}
                        className="h-10 px-4 rounded-2xl border border-slate-200 bg-white font-semibold"
                      >
                        Mark retry +1
                      </button>
                    </div>
                    {rec.audioURL && (
                      <div className="mt-3">
                        <audio controls src={rec.audioURL} />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {mode === "comp" && (
                <div className="grid gap-4">
                  <PassageViewer text={passage?.text} onWordClick={onWord} highlightSentenceIndex={highlight} />
                  <ComprehensionQuiz
                    questions={passage?.questions || []}
                    onComplete={(r) => saveAttempt({ comprehension: r })}
                  />
                </div>
              )}
            </div>
          </div>
        </PaywallGate>
      </div>
    </main>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 rounded-2xl border text-sm font-semibold transition ${
        active ? "bg-brand-primary text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
