"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
const SUBJECTS = {
  maths: {
    title: "Maths",
    headline: "Turn numbers into confidence.",
    sub: "Short lessons that match school skills — with practice that sticks.",
    icon: "➕",
    tiles: ["/illustrations/subjects/world-maths.webp"],
  },
  english: {
    title: "English",
    headline: "Build reading and writing power.",
    sub: "Phonics, comprehension and writing — in kid-friendly steps.",
    icon: "📚",
    tiles: ["/illustrations/subjects/world-english.webp"],
  },
  reading: {
    title: "Reading",
    headline: "Build reading power every week.",
    sub: "Comprehension, vocabulary and fluency — in kid-friendly steps.",
    icon: "📖",
    tiles: ["/illustrations/subjects/world-reading.webp"],
  },
  science: {
    title: "Science",
    headline: "Curiosity becomes confidence.",
    sub: "Hands-on investigations and real-world explanations.",
    icon: "🧪",
    tiles: ["/illustrations/subjects/world-science.webp"],
  },
  hass: {
    title: "HASS",
    headline: "People, places and stories.",
    sub: "History, geography and civics — with maps and missions.",
    icon: "🗺️",
    tiles: ["/illustrations/subjects/world-energy.webp"],
    comingSoon: true,
  },
  hpe: {
    title: "HPE",
    headline: "Healthy bodies, strong minds.",
    sub: "Movement, wellbeing and safety — with playful challenges.",
    icon: "🏃",
    tiles: ["/illustrations/subjects/world-health.webp"],
    comingSoon: true,
  },
  arts: {
    title: "The Arts",
    headline: "Creativity, expression and confidence.",
    sub: "Music, visual arts, drama and media — with guided projects.",
    icon: "🎨",
    tiles: ["/illustrations/subjects/world-arts.webp"],
    comingSoon: true,
  },
  technologies: {
    title: "Technologies",
    headline: "Design, build and create.",
    sub: "Digital skills and design thinking — one mini project at a time.",
    icon: "🛠️",
    tiles: ["/illustrations/subjects/world-energy.webp"],
    comingSoon: true,
  },
  languages: {
    title: "Languages",
    headline: "Hello, world.",
    sub: "Listening, speaking and signing — with short daily practice.",
    icon: "🌏",
    tiles: ["/illustrations/subjects/world-languages.webp"],
    comingSoon: true,
  },
};


export default function SubjectPage() {
  const { subject } = useParams();
  const s = SUBJECTS[subject] || SUBJECTS.maths;

  return (
    
    <PageScaffold title="Subject">
<div className="container-pad py-14 space-y-10">
      <header className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-xs font-extrabold text-slate-500">SUBJECT</div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900">
            {s.title}: {s.headline}
          </h1>
          {s.comingSoon && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-extrabold">
              Coming soon
            </div>
          )}
          <p className="mt-4 text-lg font-semibold text-slate-700">{s.sub}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href="/marketing/signup" className="sk-btn-primary">Start free</Link>
            <Link href="/marketing/curriculum" className="sk-btn-muted">Curriculum alignment</Link>
          </div>
        </div>

        <div className="rounded-4xl bg-white/85 backdrop-blur border border-slate-200 shadow-elevated p-6">
          <img src={s.tiles[0]} alt="" className="w-full h-auto" />
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-5">
        <Card title="Australian Curriculum aligned" desc="Mapped by year level so learning time supports school." icon="✅" />
        <Card title="Choose-any-lesson freedom" desc="Kids can pick what they want — SmartKidz still tracks mastery." icon="🗺️" />
        <Card title="Practice that sticks" desc="Quizzes, retries, and mixed practice for understanding." icon="🎯" />
      </section>

      <section className="rounded-4xl bg-white/85 backdrop-blur border border-slate-200 shadow-soft p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Lesson preview</h2>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              This is the style of interaction inside the kid dashboard — short prompts, instant feedback, and celebratory wins.
            </p>
          </div>
          <Link href="/marketing/features" className="text-sm font-extrabold text-brand-primary">
            See all features →
          </Link>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <PreviewCard title="Mission" desc="Clear goal, one tap to start" icon="🎯" />
          <PreviewCard title="Quiz" desc="Kid-friendly practice questions" icon="❓" />
          <PreviewCard title="Rewards" desc="Confetti and badges for mastery" icon="⭐" />
        </div>
      </section>

      <section className="rounded-4xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-elevated p-10 text-center">
        <h3 className="text-3xl font-extrabold">Ready to start building confidence?</h3>
        <p className="mt-2 text-white/90 font-semibold">Create a parent account, add your kids, then jump into any lesson.</p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Link href="/marketing/signup" className="inline-flex rounded-full bg-white text-brand-primary px-7 py-3 font-extrabold shadow-soft">
            Start free
          </Link>
          <Link href="/marketing/pricing" className="inline-flex rounded-full bg-white/15 px-7 py-3 font-extrabold">
            View pricing
          </Link>
        </div>
      </section>
    </div>
  
    </Page>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="rounded-4xl bg-white/85 backdrop-blur border border-slate-200 shadow-soft p-6">
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 text-xl font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-sm font-semibold text-slate-700">{desc}</div>
    </div>
  );
}

function PreviewCard({ title, desc, icon }) {
  return (
    <div className="rounded-4xl bg-slate-50 border border-slate-200 p-6">
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 text-lg font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-sm font-semibold text-slate-700">{desc}</div>
      <div className="mt-4 h-28 rounded-3xl bg-white border border-slate-200 shadow-soft" />
    </div>
  );
}