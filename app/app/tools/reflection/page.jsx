"use client";

import { useEffect, useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { playUISound, haptic } from "@/components/ui/sound";

const EMOJIS = [
  { k: "happy", label: "Happy", icon: "😊" },
  { k: "ok", label: "Okay", icon: "🙂" },
  { k: "tired", label: "Tired", icon: "😴" },
  { k: "stuck", label: "Stuck", icon: "😟" },
  { k: "proud", label: "Proud", icon: "🌟" },
];

function isYoung(year) {
  return typeof year === "number" && year <= 1;
}

function prompts(year) {
  if (isYoung(year)) {
    return {
      easy: "What was easy today?",
      tricky: "What was tricky today?",
      proud: "What are you proud of?",
      hint: "You can tap an emoji or choose a short answer. A parent can help read the questions."
    };
  }
  return {
    easy: "What felt easy today?",
    tricky: "What felt tricky today?",
    proud: "What are you proud of?",
    hint: "Keep it short. One sentence is perfect."
  };
}

function formatDate(d) {
  try { return new Date(d).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export default function ReflectionToolPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const year = typeof activeChild?.year_level === "number" ? activeChild.year_level : 2;

  const p = useMemo(() => prompts(year), [year]);

  const [mood, setMood] = useState("happy");
  const [easy, setEasy] = useState("");
  const [tricky, setTricky] = useState("");
  const [proud, setProud] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      setLoading(true);
      if (!childId) { setItems([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from("child_reflections")
        .select("id, mood, easy, tricky, proud, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!mounted) return;
      if (error) {
        setErr(error.message);
        setItems([]);
        setLoading(false);
        return;
      }
      setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId]);

  async function save() {
    setErr("");
    if (!childId) { setErr("Select a child first."); return; }
    setSaving(true);
    try { playUISound("tap"); haptic("light"); } catch {}

    const payload = {
      child_id: childId,
      mood,
      easy: easy || null,
      tricky: tricky || null,
      proud: proud || null,
    };

    const { error } = await supabase.from("child_reflections").insert(payload);
    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    try { playUISound("complete"); haptic("light"); } catch {}
    setEasy(""); setTricky(""); setProud("");
    // reload
    const { data } = await supabase
      .from("child_reflections")
      .select("id, mood, easy, tricky, proud, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems(data || []);
    setSaving(false);
  }

  return (
    <PageMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <ChildAvatar config={activeChild?.avatar_config || {}} size={64} />
            <div>
              <div className="text-sm text-slate-500">Journal tool</div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reflection & confidence</h1>
              <p className="mt-2 text-sm md:text-base text-slate-700">
                A calm journal that helps kids notice progress and build confidence over time.
              </p>
              <div className="mt-2 text-xs text-slate-500">{p.hint}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
            <a className="skz-glass skz-border-animate skz-shine px-4 py-3 skz-press text-sm" href="/app/parent/reflections">
              Parent view →
            </a>
          </div>
        </div>
      </div>

      {err ? (
        <div className="skz-card p-5 text-rose-700">
          <div className="font-semibold">Couldn’t load/save reflections</div>
          <div className="mt-2 text-sm">{err}</div>
          <div className="mt-3 text-xs text-slate-600">
            If you haven’t created the <span className="font-mono">child_reflections</span> table yet, run the SQL in <span className="font-mono">supabase/sql/child_reflections.sql</span>.
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skz-card p-6 skz-glow skz-shine">
          <div className="text-sm font-semibold">How do you feel?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e.k}
                className={`skz-chip px-3 py-2 skz-press text-sm ${mood === e.k ? "ring-2 ring-indigo-400/60" : ""}`}
                onClick={() => { try { playUISound("tap"); } catch {}; setMood(e.k); }}
              >
                <span className="mr-2">{e.icon}</span>{e.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Field label={p.easy} value={easy} onChange={setEasy} young={isYoung(year)} />
            <Field label={p.tricky} value={tricky} onChange={setTricky} young={isYoung(year)} />
            <Field label={p.proud} value={proud} onChange={setProud} young={isYoung(year)} />
          </div>

          <button
            className="mt-5 w-full skz-glass skz-border-animate skz-shine px-5 py-3 skz-press"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save reflection"}
          </button>

          <div className="mt-3 text-xs text-slate-500">
            Private to this child. Parents can view in the Family Hub.
          </div>
        </div>

        <div className="skz-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Confidence timeline</div>
              <div className="text-xs text-slate-500 mt-1">Your reflections over time</div>
            </div>
            <div className="skz-chip px-3 py-2 text-sm">🌱 Growth</div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-slate-600">Loading…</div>
            ) : items.length ? (
              items.map((it) => (
                <div key={it.id} className="skz-glass p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold">Mood: {it.mood}</div>
                    <div className="text-xs text-slate-500">{formatDate(it.created_at)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700 space-y-1">
                    {it.easy ? <div><span className="text-slate-500">Easy:</span> {it.easy}</div> : null}
                    {it.tricky ? <div><span className="text-slate-500">Tricky:</span> {it.tricky}</div> : null}
                    {it.proud ? <div><span className="text-slate-500">Proud:</span> {it.proud}</div> : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-600">
                No reflections yet. Save your first one to start your timeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageMotion>
  );
}

function Field({ label, value, onChange, young }) {
  if (young) {
    const options = [
      "It was easy",
      "It was okay",
      "It was hard",
      "I want help",
      "I feel proud",
    ];
    return (
      <div className="skz-glass p-4">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => (
            <button key={o} className={`skz-chip px-3 py-2 text-sm skz-press ${value===o ? "ring-2 ring-indigo-400/60" : ""}`} onClick={() => onChange(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="skz-glass p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <textarea
        className="mt-2 w-full skz-glass p-3 outline-none min-h-[84px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="One sentence is perfect…"
      />
    </div>
  );
}
