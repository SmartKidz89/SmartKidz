"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionReveal from "@/components/marketing/SectionReveal";
import FAQAccordion from "@/components/marketing/FAQAccordion";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

function Chip({ children }) {
  return (
    
    <PageScaffold title="Features">
<span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  
    </Page>
  );
}

function MockVisual({ icon, title, subtitle }) {
  return (
    <div data-scene className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-400/20 blur-3xl" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{title}</div>
              <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
            </div>
          </div>
          <Chip>Preview</Chip>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="h-2 w-16 rounded-full bg-slate-200" />
            <div className="mt-2 h-2 w-10 rounded-full bg-slate-200" />
            <div className="mt-4 h-16 rounded-2xl bg-white shadow-sm" />
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="h-2 w-14 rounded-full bg-slate-200" />
            <div className="mt-2 h-2 w-12 rounded-full bg-slate-200" />
            <div className="mt-4 h-16 rounded-2xl bg-white shadow-sm" />
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="h-2 w-12 rounded-full bg-slate-200" />
            <div className="mt-2 h-2 w-16 rounded-full bg-slate-200" />
            <div className="mt-4 h-16 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-700">Calm</span>
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700">Premium</span>
          <span className="rounded-full bg-rose-600/10 px-3 py-1 text-xs font-medium text-rose-700">Kid-safe</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, who, badge }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur"
    >
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-400/15 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">{title}</div>
              <div className="mt-1 text-xs text-slate-600">{who}</div>
            </div>
          </div>
          {badge ? <Chip>{badge}</Chip> : null}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">{desc}</p>
      </div>
    </motion.div>
  );
}

const GRID = [
  // Kids + Parents blend
  { icon: "🗺️", title: "World map journey", who: "Kids", badge: "Signature", desc: "Pick a learning world and follow a guided journey that feels like a premium game — calm, playful, and motivating." },
  { icon: "🏅", title: "Rewards, streaks & badges", who: "Kids", badge: "Motivation", desc: "Earn rewards for effort and consistency. Designed to encourage progress without pressure or overstimulation." },
  { icon: "🧾", title: "Interactive worksheet builder", who: "Kids + Parents", badge: "Printable", desc: "Generate practice sheets aligned to learning. Complete on-screen or print for offline practise with an answer key." },
  { icon: "📖", title: "Kid-friendly dictionary", who: "Kids", badge: "Clarity", desc: "Fast definitions with examples. Perfect for early readers and building vocabulary confidence." },
  { icon: "🧠", title: "Lesson builder", who: "Kids + Parents", badge: "Create", desc: "Prompt-based lesson creation with year-level examples, structured practice, quizzes, and recall tips." },

  { icon: "📘", title: "Learning storybook", who: "Parents + Kids", badge: "Keepsake", desc: "A beautiful journal that turns completed lessons into story pages. Print weekly or at the end of term." },
  { icon: "🔎", title: "Curiosity explorer", who: "Kids", badge: "Kid‑safe", desc: "Ask questions and get a simple explanation, mini activity, and quiz — designed for safe, offline-style learning." },
  { icon: "🧘", title: "Calm focus mode", who: "Kids", badge: "Distraction‑free", desc: "One tap hides extra UI and keeps the screen calm, so kids can focus on one lesson at a time." },
  { icon: "🌱", title: "Reflection & confidence journal", who: "Kids + Parents", badge: "Wellbeing", desc: "Kids capture what felt easy, tricky, and proud. Parents can view reflections to support confidence at home." },
  { icon: "🧾", title: "Achievement timeline", who: "Parents + Kids", badge: "Shareable", desc: "A premium timeline of milestones (first lesson, streaks, subject firsts). Printable for parents." },

  { icon: "🔊", title: "Voice narration mode", who: "Kids", badge: "Accessibility", desc: "Read-aloud support for prompts and lesson guidance. Especially valuable for early readers and neurodiverse learners." },
  { icon: "🧑‍🎨", title: "Avatar editor", who: "Kids", badge: "Personal", desc: "A premium avatar experience that makes the app feel uniquely theirs, increasing engagement and ownership." },
  { icon: "🛡️", title: "Parent insight feed", who: "Parents", badge: "Trust", desc: "Narrative insights (not noisy analytics) that show momentum and next best steps in a calm, supportive tone." },
  { icon: "🔒", title: "Kid-safe app experience", who: "Parents", badge: "Safety", desc: "Designed to keep learning safe, calm, and age-appropriate. Clear boundaries and parent-controlled access." },
  { icon: "✨", title: "Signature motion system", who: "Everyone", badge: "Premium UX", desc: "Micro-interactions, smooth transitions, and calm animations that make SmartKidz feel expensive and delightful." },
];

export default function FeaturesPage() {
  return (
    <div data-scene className="min-h-screen">
      <Container data-scene className="pt-16 pb-10">
        <SectionReveal>
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex justify-center gap-2 flex-wrap">
              <Chip>For kids</Chip>
              <Chip>For parents</Chip>
              <Chip>Premium UX</Chip>
              <Chip>Australian curriculum aligned</Chip>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-slate-900"
            >
              Features that feel premium — and actually help kids learn
            </motion.h1>

            <p className="mt-5 text-base md:text-lg text-slate-700">
              SmartKidz combines calm, premium design with purposeful learning tools. Kids get an experience they love.
              Parents get clarity, trust, and real progress.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/app" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
                Open the app
              </Link>
              <Link href="/pricing" className="rounded-2xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur">
                View pricing
              </Link>
            </div>
          </div>
        </SectionReveal>
      </Container>

      <Container className="pb-12">
        <SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MockVisual icon="🗺️" title="World map journey" subtitle="Pick a world · choose your next step" />
            <MockVisual icon="📘" title="Learning storybook" subtitle="A beautiful keepsake for parents and kids" />
          </div>
        </SectionReveal>
      </Container>

      <Container className="pb-16">
        <SectionReveal>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-slate-500">Everything included</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                A premium learning toolkit
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-700 max-w-3xl">
                Built for a calm, high-end experience. Designed for kids. Trusted by parents.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Chip>Journeys</Chip>
              <Chip>Practice</Chip>
              <Chip>Motivation</Chip>
              <Chip>Parent tools</Chip>
              <Chip>Accessibility</Chip>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GRID.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="text-sm font-semibold text-slate-900">Made for younger learners</div>
              <p className="mt-2 text-sm text-slate-700">
                Prep–Year 2 experiences are designed for limited reading: short prompts, clear UI, and read-aloud support.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Short sessions</Chip>
                <Chip>Large touch targets</Chip>
                <Chip>Audio prompts</Chip>
              </div>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="text-sm font-semibold text-slate-900">Parent trust, built in</div>
              <p className="mt-2 text-sm text-slate-700">
                Insight feed, reflections, and printable storybooks help parents support learning at home without guesswork.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Insights</Chip>
                <Chip>Reflections</Chip>
                <Chip>Printable</Chip>
              </div>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="text-sm font-semibold text-slate-900">Premium look and feel</div>
              <p className="mt-2 text-sm text-slate-700">
                Signature motion, glass surfaces, and calm design cues make SmartKidz feel modern and worth paying for.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Motion</Chip>
                <Chip>Glass</Chip>
                <Chip>Delight</Chip>
              </div>
            </div>
          </div>
        </SectionReveal>
      </Container>

      <Container className="pb-20">
        <SectionReveal>
          <div className="rounded-3xl border border-white/60 bg-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Ready to explore?</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  Let your child pick their journey
                </h3>
                <p className="mt-2 text-sm md:text-base text-slate-700 max-w-2xl">
                  SmartKidz is designed for short, consistent sessions that compound into confidence.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/app" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
                  Open the app
                </Link>
                <Link href="/curriculum" className="rounded-2xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur">
                  View curriculum
                </Link>
              </div>
            </div>
          </div>
        </SectionReveal>
      </Container>

      <Container className="pb-20">
        <SectionReveal>
          <div className="mx-auto max-w-4xl">
            <FAQAccordion
              items={[
                {
                  q: "Do kids need to read well to use SmartKidz?",
                  a: "No. Prep–Year 2 experiences are designed for early readers with simple prompts and read-aloud support. Parents can also assist."
                },
                {
                  q: "Is everything locked behind login?",
                  a: "Parents can explore the website and features without logging in. Lessons and child progress are accessed inside the app after login."
                },
                {
                  q: "Can parents print activities?",
                  a: "Yes. The worksheet builder, storybook, and timeline all support printing for offline learning and keepsakes."
                }
              ]}
            />
          </div>
        </SectionReveal>
      </Container>
    </div>
  );
}