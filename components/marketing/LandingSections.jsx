"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Trophy, Sparkles, Map, BarChart3, Globe2, PenTool, Lightbulb, Zap } from "lucide-react";
import { useMarketingGeo } from "@/components/marketing/MarketingGeoProvider";

function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

// --- HERO SECTION ---
export function Hero() {
  const geo = useMarketingGeo();

  return (
    <section className="relative overflow-visible pt-20 pb-16 sm:pt-24 sm:pb-32">
      {/* Background Blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-100/50 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <Container className="relative">
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm backdrop-blur-md mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="mr-1">{geo.flag}</span>
            {geo.heroTag}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]"
          >
            Turn screen time into <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              real-world confidence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            SmartKidz isn't just quizzes. It's a <strong>Curiosity Engine</strong>. 
            We combine the {geo.curriculum} with creative tools—like 3D Globes, Story Writers, and Safe AI—to spark a love for learning.
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
              Explore Features
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-6 text-sm font-semibold text-slate-500"
          >
            7-day free trial • Cancel anytime • One price for the whole family
          </motion.div>
        </div>

        {/* Hero Visual - Premium 3D Style */}
        <div className="relative mx-auto max-w-5xl perspective-1000">
          
          {/* Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-sky-300/30 via-purple-300/30 to-emerald-300/30 blur-[80px] -z-10 rounded-full" />

          {/* Main Interface Card */}
          <motion.div
            initial={{ opacity: 0, rotateX: 15, y: 60 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.2, delay: 0.2 }}
            className="relative rounded-[2.5rem] border-[6px] border-white/40 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            <div className="relative rounded-[2.2rem] overflow-hidden aspect-[16/10] bg-slate-50 border-[6px] border-slate-900">
               <Image
                src="/illustrations/scenes/home-hero.webp"
                alt="SmartKidz Dashboard - Explore Worlds"
                fill
                className="object-cover object-top scale-[1.01]"
                priority
              />
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay" />
            </div>
          </motion.div>

          {/* Floating Element 1: Coins (Top Right) */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="absolute -top-8 -right-4 sm:-right-12 z-20"
          >
             <motion.div 
               animate={{ y: [0, -8, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="relative"
             >
                <div className="absolute inset-0 bg-amber-400 blur-xl opacity-30" />
                <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-0.5 rotate-6 hover:rotate-0 transition-transform cursor-default">
                   <span className="text-3xl sm:text-4xl filter drop-shadow-md">🪙</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Earned</span>
                   <span className="text-lg sm:text-xl font-black text-slate-900">+500</span>
                </div>
             </motion.div>
          </motion.div>

          {/* Floating Element 2: Level Up (Bottom Left) */}
          <motion.div
            initial={{ scale: 0, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
            className="absolute -bottom-6 -left-4 sm:-left-10 z-20"
          >
             <motion.div
               animate={{ y: [0, 8, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
               className="bg-white p-3 sm:p-4 pr-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center gap-3 -rotate-3 hover:rotate-0 transition-transform cursor-default"
             >
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl shadow-inner">🦊</div>
                <div>
                   <div className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1 border border-emerald-100">Level Up!</div>
                   <div className="text-base sm:text-lg font-black text-slate-900 leading-none">Explorer</div>
                </div>
             </motion.div>
          </motion.div>

           {/* Floating Element 3: Streak (Bottom Right) */}
           <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="absolute bottom-16 -right-2 sm:-right-6 z-10 hidden sm:block"
          >
             <motion.div
               animate={{ y: [0, -6, 0] }}
               transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="bg-white/90 backdrop-blur p-2.5 pr-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 rotate-3 hover:rotate-0 transition-transform"
             >
                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-xl shadow-sm">🔥</div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Streak</div>
                  <div className="text-sm font-black text-slate-900">7 Days</div>
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
  const geo = useMarketingGeo();
  return (
    <Container className="py-10 border-y border-slate-100 bg-slate-50/50">
      <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
        The complete learning system
      </p>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
        {[geo.mathTerm, "English", "Science", "World Explorer", "Creativity", "Safety"].map((label) => (
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
          More than just lessons. <br />
          <span className="text-slate-500">A toolkit for the imagination.</span>
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          We built the tools you <em>wish</em> existed when you were a kid. 
          Safe, educational, and endlessly fun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
        
        {/* Card 1: Curiosity Engine */}
        <div className="md:col-span-2 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Lightbulb className="w-64 h-64 text-indigo-600" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mb-6">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Curiosity Engine</h3>
              <p className="text-slate-700 font-medium leading-relaxed max-w-md">
                "Why is the sky blue?" "How do plants drink?" Kids ask big questions. 
                Our <strong>safe, kid-friendly AI</strong> gives instant, age-appropriate answers—complete with mini-quizzes and real-world experiments.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: World Explorer */}
        <div className="rounded-[2.5rem] bg-sky-50 border border-sky-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
            <Globe2 className="w-48 h-48 text-sky-600" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg mb-6">
              <Globe2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">World Explorer</h3>
            <p className="text-slate-700 font-medium">
              Spin the 3D globe. Discover countries, flags, foods, and greetings. It's geography class, but way cooler.
            </p>
          </div>
        </div>

        {/* Card 3: Creative Studio */}
        <div className="rounded-[2.5rem] bg-pink-50 border border-pink-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-1/2 -translate-y-1/2 -right-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:translate-x-2 duration-500">
            <PenTool className="w-48 h-48 text-pink-600" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-lg mb-6">
              <PenTool className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Creative Studio</h3>
            <p className="text-slate-700 font-medium">
              Write and illustrate stories with the <strong>Magic Storybook</strong>, or create retro masterpieces in <strong>Pixel Art</strong>.
            </p>
          </div>
        </div>

        {/* Card 4: Parent Peace of Mind */}
        <div className="md:col-span-2 rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg mb-6 border border-slate-700">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">A Walled Garden</h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                We take safety seriously. <strong>No ads. No external links. No chat.</strong>
                <br/>
                Plus, weekly parent reports sent right to your inbox, so you know exactly what they've mastered.
              </p>
            </div>
            <div className="shrink-0 relative">
               <div className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-3xl shadow-inner border border-white/10 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform">
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
  const geo = useMarketingGeo();
  
  const subjects = [
    { id: "math", name: geo.mathTerm, color: "bg-sky-500", img: "/illustrations/subjects/world-maths.webp" },
    { id: "eng", name: "English", color: "bg-violet-500", img: "/illustrations/subjects/world-english.webp" },
    { id: "sci", name: "Science", color: "bg-emerald-500", img: "/illustrations/subjects/world-science.webp" },
    { id: "lang", name: "Languages", color: "bg-indigo-500", img: "/illustrations/subjects/world-languages.webp" },
  ];

  return (
    <Container className="py-20 bg-slate-50 rounded-[3rem] my-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Plus, the Core Curriculum</h2>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Mapped to the {geo.curriculum} for {geo.gradeTerm}s 1–6. We make the "boring stuff" fun.
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
            Ready to give them a head start?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 font-medium mb-10 leading-relaxed">
            Join thousands of families building confidence with SmartKidz.
            Full access to every tool and subject.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://app.smartkidz.app/app/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-slate-900 shadow-xl hover:scale-105 hover:bg-indigo-50 transition-all"
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