"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const NODES = [
  { id: "base-camp", label: "Base Camp", type: "start", x: 18, y: 78 },
  { id: "counting-trail", label: "Counting Trail", type: "lesson", x: 30, y: 62 },
  { id: "number-bridge", label: "Number Bridge", type: "practice", x: 46, y: 52 },
  { id: "fraction-pass", label: "Fraction Pass", type: "lesson", x: 62, y: 40 },
  { id: "logic-ridge", label: "Logic Ridge", type: "challenge", x: 48, y: 28 },
  { id: "summit", label: "Summit Challenge", type: "mastery", x: 66, y: 18 },
];

// Demo progress (wire to DB later)
const COMPLETED = new Set(["base-camp", "counting-trail"]);

function NodeChip({ type }) {
  const map = {
    start: { text: "Start", cls: "bg-white/80 text-slate-700" },
    lesson: { text: "Lesson", cls: "bg-sky-500 text-white" },
    practice: { text: "Practice", cls: "bg-indigo-500 text-white" },
    challenge: { text: "Challenge", cls: "bg-amber-500 text-white" },
    mastery: { text: "Boss", cls: "bg-rose-500 text-white" },
  };
  const m = map[type] ?? map.lesson;
  return <span className={cn("rounded-full px-2 py-1 text-[11px] font-extrabold", m.cls)}>{m.text}</span>;
}

export function MathMountains() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(900px_500px_at_20%_10%,rgba(56,189,248,0.35),transparent_60%),radial-gradient(900px_500px_at_75%_10%,rgba(99,102,241,0.22),transparent_60%),linear-gradient(to_bottom,#c7e8ff,#f8fafc)]">
      <HomeCloud to="/app" label="World Map" />

      {/* Mountain layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-[-120px] left-[-120px] h-[520px] w-[720px] rotate-[6deg] rounded-[140px] bg-white/55 blur-[1px]" />
        <div className="absolute bottom-[-160px] right-[-160px] h-[560px] w-[760px] rotate-[-8deg] rounded-[160px] bg-white/55 blur-[1px]" />

        <div className="absolute bottom-[-40px] left-1/2 h-[720px] w-[980px] -translate-x-1/2 rounded-[220px] bg-white/55 blur-[2px]" />
        <div className="absolute bottom-[40px] left-1/2 h-[620px] w-[880px] -translate-x-1/2 rounded-[200px] bg-white/65 shadow-[var(--shadow-e1)]" />

        {/* Snow caps */}
        <div className="absolute left-[18%] top-[18%] h-28 w-44 rotate-[-8deg] rounded-[999px] bg-white/70" />
        <div className="absolute left-[62%] top-[14%] h-24 w-40 rotate-[10deg] rounded-[999px] bg-white/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-700">World</div>
            <div className="text-3xl font-extrabold text-slate-900">Math Mountains</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              Climb the path, build bridges, and master new skills.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Quest Path</Badge>
            <Badge variant="success">2 completed</Badge>
          </div>
        </div>
      </div>

      {/* Path canvas */}
      <div className="relative z-10 mx-auto mt-8 h-[72vh] max-w-5xl px-5">
        <div className="relative h-full w-full rounded-[var(--radius-lg)] border border-white/60 bg-white/55 shadow-[var(--shadow-e1)] backdrop-blur overflow-hidden">
          {/* Path line */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M18 78 C 26 70, 28 66, 30 62 C 34 56, 40 55, 46 52 C 54 48, 57 44, 62 40 C 57 34, 54 31, 48 28 C 56 22, 60 20, 66 18"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M18 78 C 26 70, 28 66, 30 62 C 34 56, 40 55, 46 52 C 54 48, 57 44, 62 40 C 57 34, 54 31, 48 28 C 56 22, 60 20, 66 18"
              fill="none"
              stroke="rgba(14,165,233,0.35)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Nodes */}
          {NODES.map((n) => {
            const done = COMPLETED.has(n.id);
            const locked = !done && !COMPLETED.has(prevNodeId(n.id));
            return (
              <motion.button
                key={n.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2",
                  "rounded-[var(--radius-lg)] px-4 py-3 text-left",
                  "border backdrop-blur shadow-[var(--shadow-e1)]",
                  done
                    ? "bg-white/90 border-white/60"
                    : locked
                    ? "bg-white/55 border-white/50 opacity-70"
                    : "bg-white/85 border-white/60"
                )}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                whileHover={locked ? {} : { scale: 1.04, y: -2 }}
                whileTap={locked ? {} : { scale: 0.98 }}
                onClick={() => {
                  if (locked) return;
                  router.push(`/app/world/math/lesson/${n.id}`);
                }}
                aria-label={n.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900">{n.label}</div>
                  <NodeChip type={n.type} />
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  {done ? "Completed" : locked ? "Locked" : "Ready"}
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition", done ? "w-full bg-emerald-500" : locked ? "w-0 bg-slate-300" : "w-2/5 bg-sky-500")}
                  />
                </div>
              </motion.button>
            );
          })}

          {/* Avatar marker */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "30%", top: "62%" }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <div className="h-11 w-11 rounded-full bg-sky-500/90 shadow-[var(--shadow-e1)] border-4 border-white" />
            <div className="mx-auto mt-1 h-2 w-8 rounded-full bg-slate-900/10 blur-[1px]" />
          </motion.div>
        </div>

        <div className="mt-4 text-center text-xs font-semibold text-slate-700">
          Tip: Complete nodes in order to unlock the path. Your mountain will build as you learn.
        </div>
      </div>
    </div>
  );
}

function prevNodeId(id) {
  const idx = NODES.findIndex((n) => n.id === id);
  if (idx <= 0) return NODES[0].id;
  return NODES[idx - 1].id;
}
