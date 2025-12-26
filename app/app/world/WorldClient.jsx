"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useSelectedYear } from "@/hooks/useSelectedYear";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import MasteryRing from "@/components/ui/MasteryRing";
import AvatarBadge from "@/components/app/AvatarBadge";
import PaywallGate from "@/components/app/PaywallGate";

import { transitions } from "@/lib/motion";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { getThemePreset } from "../../../lib/themePresets";

function NodeCard({ node, onOpen }) {
  const locked = Boolean(node.locked);
  const status = node.status ?? "not_started";
  const ratio = node.mastery_score ?? (status === "completed" ? 1 : 0);

  const Icon = locked ? Lock : status === "completed" ? CheckCircle2 : Play;

  return (
    <motion.button
      type="button"
      disabled={locked}
      onClick={() => (!locked ? onOpen?.(node.id) : null)}
      whileHover={locked ? undefined : { y: -4, scale: 1.01 }}
      whileTap={locked ? undefined : { scale: 0.99 }}
      transition={transitions.card}
      className={`group relative w-full rounded-[28px] p-4 text-left ring-1 transition ${
        locked
          ? "bg-slate-100 ring-slate-200 opacity-80"
          : "bg-white ring-slate-200 hover:-translate-y-[2px] hover:shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900 line-clamp-2">
            {node.title}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-600">{node.topic}</div>
        </div>
        <div className="flex items-center gap-2">
          <MasteryRing value={ratio} size={34} strokeWidth={6} />
          <div
            className={`h-10 w-10 rounded-2xl grid place-items-center ${
              locked ? "bg-slate-200 text-slate-600" : "bg-indigo-50 text-brand-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {!locked && status === "in_progress" && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
          Continue
          <ChevronRight className="h-4 w-4" />
        </div>
      )}

      {locked && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700">
          Locked
        </div>
      )}
    </motion.button>
  );
}

export default function WorldClient() {
  const { activeChild } = useActiveChild();
  const { year: selectedYear } = useSelectedYear();
  const sp = useSearchParams();
  const subjectParam = sp.get("subject");
  const yearParam = sp.get("year");
  const childParam = sp.get("child");

  const normalizeSubject = (s) => {
    const v = (s || "").toUpperCase();
    if (!v) return "MAT";
    if (v === "MATH" || v === "MATHS") return "MAT";
    if (v === "ENGLISH" || v === "READING") return "ENG";
    if (v === "SCIENCE") return "SCI";
    if (v === "HASS") return "HASS";
    if (v === "HPE" || v === "HEALTH") return "HPE";
    if (v === "ARTS") return "ARTS";
    if (v === "TECH" || v === "TECHNOLOGIES") return "TECH";
    if (v === "LANG" || v === "LANGUAGES") return "LANG";
    return v;
  };

  const subject = normalizeSubject(subjectParam);
  const year = yearParam ? parseInt(yearParam, 10) : null;

  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [continueLessonId, setContinueLessonId] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) {
        setLoading(false);
        setError("You must be logged in to open a world.");
        return;
      }

      // Resolve child
      let childRow = null;

      // 1) URL param wins (deep links)
      if (childParam) {
        const { data } = await supabase
          .from("children")
          .select("id,display_name,year_level,avatar_config")
          .eq("id", childParam)
          .limit(1);
        childRow = data?.[0] ?? null;
      }

      // 2) Otherwise use active child from cookie/context
      if (!childRow && activeChild?.id) {
        const { data } = await supabase
          .from("children")
          .select("id,display_name,year_level,avatar_config")
          .eq("id", activeChild.id)
          .limit(1);
        childRow = data?.[0] ?? null;
      }

      // 3) Final fallback (legacy): first child for this parent
      if (!childRow) {
        const { data } = await supabase
          .from("children")
          .select("id,display_name,year_level,avatar_config")
          .eq("parent_id", uid)
          .order("created_at", { ascending: true })
          .limit(1);
        childRow = data?.[0] ?? null;
      }

      setChild(childRow);

      if (!childRow) {
        setError(
          "We couldn’t find a learner profile for this account yet. Please go back and add a child first."
        );
        setNodes([]);
        setContinueLessonId(null);
        setLoading(false);
        return;
      }

      const effectiveYear = Number.isFinite(year) ? year : childRow?.year_level ?? 0;

      // Catalog nodes
      const { data: catalog, error: cErr } = await supabase
        .from("lesson_catalog")
        .select("id,title,topic,subject_id,year_level,updated_at")
        .eq("subject_id", subject)
        .eq("year_level", effectiveYear)
        .order("id", { ascending: true });

      if (cErr) {
        setError(cErr.message || "Could not load lessons for this world.");
        setNodes([]);
        setContinueLessonId(null);
        setLoading(false);
        return;
      }

      const lessonIds = (catalog ?? []).map((l) => l.id);

      let progress = [];
      if (childRow?.id && lessonIds.length) {
        const { data: prog } = await supabase
          .from("lesson_progress")
          .select("lesson_id,status,mastery_score,updated_at")
          .eq("child_id", childRow.id)
          .in("lesson_id", lessonIds);
        progress = prog ?? [];
      }

      const pMap = new Map(progress.map((p) => [p.lesson_id, p]));

      // Currently: no lock rules (all unlocked). Keep `locked` for future.
      const merged = (catalog ?? []).map((l) => {
        const p = pMap.get(l.id);
        return {
          ...l,
          status: p?.status ?? "not_started",
          mastery_score: p?.mastery_score ?? 0,
          locked: false,
        };
      });

      // continue: latest in_progress else first not completed
      const inprog = progress
        .filter((p) => p.status === "in_progress")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

      let cont = inprog?.lesson_id ?? null;
      if (!cont) {
        const next = merged.find((n) => !n.locked && n.status !== "completed");
        cont = next?.id ?? null;
      }
      setContinueLessonId(cont);
      setNodes(merged);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Something went wrong loading this world.");
      setNodes([]);
      setContinueLessonId(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, year, childParam]);

  const theme = getThemePreset(child?.avatar_config?.themeId ?? "rainbow");
  const avatarId = child?.avatar_config?.avatarId ?? "lion";

  function openLesson(lessonId) {
    const childQ = child?.id ? `?child=${child.id}` : "";
    window.location.href = `/app/lesson/${lessonId}${childQ}`;
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${theme.heroGradient}`}>
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button href="/app" variant="secondary">
                  <ChevronLeft className="h-4 w-4" /> Home
                </Button>
                <AvatarBadge
                  avatarId={avatarId}
                  size={52}
                  className="bg-white/90 ring-1 ring-white/50"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-700">World</div>
                  <div className="text-2xl font-black text-slate-900">
                    {subject} · Year {year}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {child ? `Learner: ${child.display_name}` : "Pick a learner in Home"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {continueLessonId ? (
                  <Button onClick={() => openLesson(continueLessonId)}>
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    No lessons yet
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <Card className="p-7">
                <div className="text-slate-700">Loading world…</div>
              </Card>
            ) : error ? (
              <Card className="p-7">
                <div className="text-lg font-extrabold text-slate-900">Can’t open this world</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{error}</div>
                <div className="mt-5 flex gap-2">
                  <Button href="/app" variant="secondary">
                    Back to Home
                  </Button>
                  <Button onClick={() => load()} variant="outline">
                    Try again
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/80 ring-1 ring-white/60 grid place-items-center">
                      <Sparkles className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">Choose your journey</div>
                      <div className="text-slate-700 text-sm font-semibold">
                        Pick any lesson — your progress and mastery will update as you go.
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("lesson-strip")
                          ?.scrollBy({ left: -520, behavior: "smooth" })
                      }
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("lesson-strip")
                          ?.scrollBy({ left: 520, behavior: "smooth" })
                      }
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-[28px] bg-white/70 ring-1 ring-white/60 p-4 sm:p-5 overflow-hidden">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
                    <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200/70" />
                  </div>

                  <div
                    id="lesson-strip"
                    className={
                      "relative pb-3 pt-2 scroll-smooth " +
                      // Mobile: swipeable carousel with a "peek" so it feels intentional (no dead space)
                      "flex gap-4 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory " +
                      // Desktop: clean grid (no slider) for a more professional, seamless layout
                      "sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 sm:overflow-visible sm:snap-none"
                    }
                    style={{ WebkitOverflowScrolling: "touch" }}
                    aria-label="Lesson list"
                  >
                    {nodes.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        className={
                          // Mobile card width adapts to screen, prevents large empty gaps
                          "snap-start shrink-0 w-[78vw] max-w-[340px] " +
                          // Desktop grid items take full column width
                          "sm:w-auto sm:max-w-none"
                        }
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={transitions.card}
                      >
                        <div className="relative">
                          <div className="absolute -top-2 left-5 h-5 w-5 rounded-full bg-white ring-2 ring-slate-200" />
                          <div className="absolute -top-1 left-[18px] text-[10px] font-black text-slate-600">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                        </div>
                        <NodeCard node={n} onOpen={openLesson} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Subtle scroll fades on mobile so the carousel reads as intentional */}
                  <div className="pointer-events-none sm:hidden absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white/70 to-transparent" />
                  <div className="pointer-events-none sm:hidden absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/70 to-transparent" />

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Completed: {nodes.filter((n) => n.status === "completed").length}/{nodes.length}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                      Tap a card to start
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Card className="p-6 bg-white/80 ring-1 ring-white/50">
              <div className="text-sm font-extrabold text-slate-900">Tip</div>
              <div className="mt-1 text-slate-700">
                Pick any lesson to start. Your mastery ring fills up as you finish activities, and revision will appear
                when you need it.
              </div>
            </Card>
          </div>
        </PaywallGate>
      </div>
    </main>
  );
}
