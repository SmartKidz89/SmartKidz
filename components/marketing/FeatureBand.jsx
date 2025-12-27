"use client";
import { FadeUp } from "./Motion";

const FEATURES = [
  {
    icon: "🎯",
    title: "Daily missions kids actually finish",
    desc: "Short lessons, instant feedback, and streaks that build habits — without nagging.",
  },
  {
    icon: "🧩",
    title: "Adaptive practice",
    desc: "Automatically revisits weak spots and escalates difficulty when your child is ready.",
  },
  {
    icon: "🧾",
    title: "Parent controls & reports",
    desc: "Weekly email reports, time controls, subject focus, and curriculum progress visibility.",
  },
  {
    icon: "🏆",
    title: "Rewards that motivate",
    desc: "Badges, energy boosts, celebrations, and milestones designed for ages 6–12.",
  },
];

export default function FeatureBand() {
  return (
    <section className="container-pad py-14">
      <FadeUp>
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900">Built to hook attention — and keep it.</h2>
          <p className="mt-3 text-slate-700 font-semibold max-w-2xl mx-auto">
            SmartKidz combines curriculum-aligned learning with game design: clear goals, fast wins, and visible progress.
          </p>
        </div>
      </FadeUp>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f, idx) => (
          <FadeUp key={f.title} delay={idx * 0.05}>
            <div className="rounded-4xl border border-slate-200 bg-white/75 glass shadow-soft p-6">
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-3 text-lg font-extrabold text-slate-900">{f.title}</div>
              <div className="mt-2 text-sm font-semibold text-slate-600">{f.desc}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
