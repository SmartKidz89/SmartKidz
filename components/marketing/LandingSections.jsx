"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Trophy, Sparkles, Map, BarChart3, Star, Zap } from "lucide-react";

function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

// --- NEW HERO VISUAL COMPONENT ---
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[1000px] perspective-[2000px]">
      {/* Glow / Aura behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-sky-400/20 via-fuchsia-400/20 to-amber-400/20 blur-[100px] rounded-full" />

      {/* Main Interface Container - Tilted 3D Effect */}
      <motion.div
        initial={{ rotateX: 20, rotateY: -12, y: 100, opacity: 0 }}
        animate={{ rotateX: 5, rotateY: -5, y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] overflow-hidden aspect-[16/10]"
      >
        {/* Fake Browser/App Chrome */}
        <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-white/50">
          <div className="w-3 h-3 rounded-full bg-rose-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
        </div>

        {/* Dashboard Content Mockup */}
        <div className="p-6 md:p-8 h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col relative">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">
                🦁
              </div>
              <div>
                <div className="h-2 w-24 bg-slate-200 rounded-full mb-2" />
                <div className="h-4 w-40 bg-slate-900 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="text-amber-400">🪙</span>
                <span className="font-bold text-slate-700">450</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="text-rose-500">🔥</span>
                <span className="font-bold text-slate-700">12 Days</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Main Featured Lesson - Left */}
            <div className="col-span-8 rounded-3xl bg-white border border-slate-100 shadow-lg p-6 relative overflow-hidden group cursor-default">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-100 to-transparent rounded-bl-full opacity-50" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wide mb-4">
                  <Map className="w-3 h-3" /> Up Next
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Maths Adventure</h3>
                <p className="text-slate-500 font-medium mb-6">Mastering Fractions & Decimals</p>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "65%" }} 
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="h-full bg-sky-500 rounded-full" 
                  />
                </div>

                <div className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                  Continue Lesson <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Side Quest - Right */}
            <div className="col-span-4 flex flex-col gap-4">
              <div className="flex-1 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-50 p-5 relative overflow-hidden flex flex-col justify-center items-center text-center">
                <div className="text-4xl mb-2 animate-bounce">🏆</div>
                <div className="font-bold text-amber-900">Weekly Challenge</div>
                <div className="text-xs text-amber-700 font-semibold mt-1">3/5 Complete</div>
              </div>
              <div className="flex-1 rounded-3xl bg-white border border-slate-100 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Finished</div>
                  <div className="font-bold text-slate-900">Reading</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Floating Elements (Orbiting) */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-8 -right-8 z-20"
      >
        <div className="bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-3 rotate-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-2xl shadow-inner text-white">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Unlocked</div>
            <div className="font-black text-slate-800 text-lg">Super Star</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-10 -left-10 z-20"
      >
        <div className="bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-3 -rotate-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl shadow-inner text-white">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Skill</div>
            <div className="font-black text-slate-800 text-lg">Mastered</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

// --- HERO SECTION ---
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-32">
      <Container className="relative">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm backdrop-blur-md mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Australian Curriculum Aligned • Prep to Year 6
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            The screen time you’ll <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              actually feel good about.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            SmartKidz turns Maths, English, and Science into a calm, confidence-building adventure. 
            No ads. No pressure. Just real learning progress.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="https://app.smartkidz.app/app/signup"
              className="h-14 px-8 rounded-full bg-slate-900 text-white text-lg font-bold shadow-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
            >
              Start Free Trial <Sparkles className="w-5 h-5 text-amber-300" />
            </Link>
            <Link
              href="#how-it-works"
              className="h-14 px-8 rounded-full bg-white border border-slate-200 text-slate-700 text-lg font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-6 text-sm font-semibold text-slate-500"
          >
            7-day free trial • Cancel anytime • Unlimited kids
          </motion.div>
        </div>

        {/* 3D Dashboard Visual */}
        <HeroVisual />

      </Container>
    </section>
  );
}

// --- SOCIAL PROOF ---
export function LogoStrip() {
  return (
    <Container className="py-10 border-y border-slate-100 bg-slate-50/50">
      <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
        Trusted by Australian families for
      </p>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
        {["Maths Mastery", "English Confidence", "Science Discovery", "Exam Prep", "School Readiness"].map((label) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-brand-mint" />
            <span className="font-extrabold text-slate-900">{label}</span>
          </div>
        ))}
      </div>
    </Container>
  );
}

// --- FEATURE BENTO GRID ---
export function FeatureGrid() {
  return (
    <Container id="how-it-works" className="py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
          Everything they need to grow. <br />
          <span className="text-slate-500">Nothing they don't.</span>
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          We stripped away the ads, the addictive social hooks, and the clutter. 
          What's left is a pure, premium learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
        {/* Card 1: Adaptive */}
        <div className="md:col-span-2 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <Map className="w-64 h-64 text-indigo-600" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mb-6">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Adaptive Learning Paths</h3>
              <p className="text-slate-700 font-medium leading-relaxed max-w-md">
                SmartKidz adapts to your child's pace. Struggle with a topic? We'll offer a helpful hint and a different angle. Cruising along? We'll serve up a challenge to keep them engaged.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Rewards */}
        <div className="rounded-[2.5rem] bg-amber-50 border border-amber-100 p-8 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-48 h-48 text-amber-600" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg mb-6">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Rewards that Matter</h3>
            <p className="text-slate-700 font-medium">
              Earn XP, unlock avatar gear, and build streaks. We use motivation to build habits, not addiction.
            </p>
          </div>
        </div>

        {/* Card 3: Parent Insights */}
        <div className="rounded-[2.5rem] bg-emerald-50 border border-emerald-100 p-8 relative overflow-hidden group">
          <div className="absolute top-1/2 -translate-y-1/2 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-48 h-48 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg mb-6">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Insights for You</h3>
            <p className="text-slate-700 font-medium">
              Get a weekly summary of their progress. Know exactly where they are excelling and where they might need a hug or a high-five.
            </p>
          </div>
        </div>

        {/* Card 4: Safe */}
        <div className="md:col-span-2 rounded-[2.5rem] bg-rose-50 border border-rose-100 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.1),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">100% Kid-Safe Environment</h3>
              <p className="text-slate-700 font-medium leading-relaxed">
                We take safety seriously. SmartKidz has <strong>no ads</strong>, <strong>no external links</strong>, and <strong>no chat functionality</strong>. It is a walled garden designed purely for learning and confidence.
              </p>
            </div>
            <div className="shrink-0 relative">
               {/* Visual filler for safety */}
               <div className="w-40 h-40 bg-white rounded-3xl shadow-sm border border-rose-100 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform">
                  <span className="text-6xl">🔒</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

// --- SUBJECT TILES ---
export function SubjectTiles() {
  const subjects = [
    { id: "math", name: "Maths", color: "bg-sky-500", img: "/illustrations/subjects/world-maths.webp" },
    { id: "eng", name: "English", color: "bg-violet-500", img: "/illustrations/subjects/world-english.webp" },
    { id: "sci", name: "Science", color: "bg-emerald-500", img: "/illustrations/subjects/world-science.webp" },
    { id: "lang", name: "Languages", color: "bg-indigo-500", img: "/illustrations/subjects/world-languages.webp" },
  ];

  return (
    <Container className="py-20 bg-slate-50 rounded-[3rem] my-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Explore our Worlds</h2>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Every subject is a unique world to explore. Mapped to the Australian Curriculum for Years 1–6.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {subjects.map((s) => (
          <Link key={s.id} href={`/marketing/subjects/${s.id}`} className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-2">
            <Image src={s.img} alt={s.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            <div className="absolute bottom-0 inset-x-0 p-5">
              <div className="text-white font-black text-xl md:text-2xl">{s.name}</div>
              <div className="text-white/80 text-sm font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore →</div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}

// --- CTA ---
export function CTA() {
  return (
    <Container className="py-24">
      <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden px-6 py-16 sm:px-16 sm:py-20 text-center">
        {/* Background FX */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-3xl" />
          <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to build their confidence?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 font-medium mb-10 leading-relaxed">
            Join thousands of Australian families using SmartKidz to make learning fun again. 
            Start your free 7-day trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://app.smartkidz.app/app/signup"
              className="h-14 px-8 rounded-full bg-white text-slate-900 text-lg font-bold shadow-lg hover:bg-slate-100 hover:scale-105 transition-all flex items-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/marketing/pricing"
              className="h-14 px-8 rounded-full bg-transparent border-2 border-slate-700 text-white text-lg font-bold hover:bg-slate-800 transition-all flex items-center"
            >
              View Pricing
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 font-semibold">
            No credit card required for preview • Cancel anytime
          </p>
        </div>
      </div>
    </Container>
  );
}