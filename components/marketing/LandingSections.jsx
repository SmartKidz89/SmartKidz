"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Trophy, Sparkles, Map, BarChart3 } from "lucide-react";

function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

// --- HERO SECTION ---
export function Hero() {
  return (
    <section className="relative overflow-visible pt-20 pb-16 sm:pt-28 sm:pb-32">
      {/* Background Ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-200/40 via-indigo-100/20 to-transparent rounded-full blur-[100px]" 
        />
      </div>

      <Container className="relative">
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200/60 px-4 py-1.5 text-xs font-extrabold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Australian Curriculum Aligned • Prep to Year 6
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]"
          >
            The screen time you’ll <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-indigo-600">
              actually feel good about.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            SmartKidz transforms Maths, English, and Science into a calm, confidence-building adventure. 
            Aligned to the Australian Curriculum, without the pressure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="https://app.smartkidz.app/app/signup"
              className="group relative h-14 px-8 rounded-full bg-slate-900 text-white text-lg font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-1 transition-all flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
              Start Free Trial <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </Link>
            <Link
              href="#how-it-works"
              className="h-14 px-8 rounded-full bg-white border border-slate-200 text-slate-700 text-lg font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-6 text-sm font-semibold text-slate-400"
          >
            7-day free trial • Cancel anytime • Unlimited kids
          </motion.div>
        </div>

        {/* --- 3D HERO VISUAL --- */}
        <div className="relative mx-auto max-w-5xl perspective-1200 mt-10">
          
          {/* Main "Tablet" Container */}
          <motion.div
            initial={{ opacity: 0, rotateX: 10, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.1, delay: 0.2 }}
            className="relative z-10 rounded-[2.5rem] bg-slate-900 p-2 sm:p-3 shadow-2xl ring-1 ring-white/10"
          >
            {/* Screen Inner */}
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 aspect-[16/10] shadow-inner">
               <Image
                src="/illustrations/app/kids-dashboard-header.webp"
                alt="SmartKidz Dashboard"
                fill
                className="object-cover"
                priority
              />
              
              {/* Screen Reflection / Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/0 to-transparent pointer-events-none mix-blend-overlay" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] mix-blend-screen pointer-events-none" />
            </div>

            {/* Hardware Shine */}
            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />
          </motion.div>

          {/* --- Floating Elements --- */}

          {/* Left: Parent Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="absolute -bottom-12 -left-4 sm:-left-12 z-20 w-64 hidden md:block"
          >
             <motion.div
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-white/60 flex flex-col gap-3"
             >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg shadow-sm">📈</div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</div>
                    <div className="text-sm font-black text-slate-900">+12% Mastery</div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-emerald-500 rounded-full" />
                </div>
             </motion.div>
          </motion.div>

          {/* Right: Quest Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.0, type: "spring", stiffness: 150 }}
            className="absolute -top-12 -right-6 sm:-right-16 z-20 w-auto"
          >
             <motion.div 
               animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="relative"
             >
                <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full" />
                <div className="bg-white p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/80 flex items-center gap-3">
                   <span className="text-4xl filter drop-shadow-sm">🏆</span>
                   <div className="pr-2">
                     <div className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">Quest Complete!</div>
                     <div className="text-lg font-black text-slate-900 leading-none">+250 XP</div>
                   </div>
                </div>
             </motion.div>
          </motion.div>

        </div>
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
        <div className="md:col-span-2 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
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
        <div className="rounded-[2.5rem] bg-amber-50 border border-amber-100 p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
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
        <div className="rounded-[2.5rem] bg-emerald-50 border border-emerald-100 p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-1/2 -translate-y-1/2 -right-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:translate-x-2 duration-500">
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
        <div className="md:col-span-2 rounded-[2.5rem] bg-rose-50 border border-rose-100 p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
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