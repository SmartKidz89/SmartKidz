"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Map, Trophy, Shield, Sparkles, Zap, Brain, 
  BarChart3, Globe, Lock, BookOpen,
  Palette, Calculator, FlaskConical, Smile,
  CheckCircle2, ArrowRight, Layout, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketingGeo } from "@/components/marketing/MarketingGeoProvider";

// --- Components ---

function Container({ children, className = "" }) {
  return <div className={cn("container-pad px-6", className)}>{children}</div>;
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 mb-4 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
      {children}
    </div>
  );
}

// Parallax Image Component
function ParallaxImage({ src, alt, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-900/5 bg-slate-100", className)}>
      <motion.div style={{ y, scale }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay" />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 mb-4 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm font-medium text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// --- Main Page ---

export default function FeaturesPage() {
  const geo = useMarketingGeo();

  return (
    <div className="bg-slate-50/50">
      
      {/* 1. HERO */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-100/40 via-purple-100/20 to-transparent rounded-full blur-[80px] -z-10" />
        
        <Container className="text-center max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]"
          >
            Features that feel <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-500 to-purple-600">
              like a superpower.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl text-slate-600 font-medium max-w-2xl mx-auto"
          >
            We combined the best of game design with the rigour of the {geo.curriculum}.
            Kids get hooked on progress. You get peace of mind.
          </motion.p>
        </Container>
      </section>


      {/* 2. THE KID EXPERIENCE (Bento) */}
      <section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-12 gap-8 items-center mb-12">
            <div className="lg:col-span-5">
              <SectionLabel>For Kids</SectionLabel>
              <h2 className="text-4xl font-black text-slate-900 mb-4">A world they want to explore.</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                No boring lists. Kids choose a world—{geo.mathTerm}, Reading, or Science—and travel through levels. 
                Every lesson unlocks rewards, badges, and gear for their avatar.
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Choose their own path",
                  "Earn coins & upgrade avatars",
                  "Streaks that build daily habits"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-800 font-bold">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <ParallaxImage 
                src="/illustrations/app/kids-dashboard-header.webp" 
                alt="Kids Dashboard"
                className="aspect-[4/3]" 
              />
            </div>
          </div>

          {/* Feature Strip */}
          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Map} 
              title="World Journeys" 
              desc="Visual maps that make progress visible and exciting. No endless lists of links." 
              delay={0.1}
            />
            <FeatureCard 
              icon={Smile} 
              title="Avatars" 
              desc="Fully customizable characters. Spend earned coins on hats, outfits, and rare items." 
              delay={0.2}
            />
            <FeatureCard 
              icon={Trophy} 
              title="Smart Rewards" 
              desc="Badges and streaks designed to motivate consistency, not addiction." 
              delay={0.3}
            />
          </div>
        </Container>
      </section>


      {/* 3. THE LEARNING ENGINE (Dark/Contrast Section) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden my-10 rounded-[3rem] mx-4 sm:mx-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 mb-4 backdrop-blur-md">
              The Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Real learning. Zero fluff.</h2>
            <p className="text-xl text-slate-300 font-medium">
              Under the hood, SmartKidz is a serious learning engine aligned to the {geo.curriculum}.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <div className="relative order-2 lg:order-1">
              <ParallaxImage 
                src="/illustrations/app/lesson-quiz.webp" 
                alt="Lesson Interface"
                className="aspect-square border-white/10 shadow-indigo-900/50" 
              />
              {/* Floating element */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 bottom-12 bg-white text-slate-900 p-4 rounded-2xl shadow-xl max-w-[200px] hidden md:block"
              >
                <div className="flex gap-2 mb-2 text-emerald-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase">Instant Feedback</div>
                <div className="font-black text-sm">"Great job! That's correct."</div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-8">
               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                   <Brain className="w-6 h-6 text-indigo-300" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Adaptive Practice</h3>
                   <p className="text-slate-400 leading-relaxed">
                     Our engine adjusts to your child. Struggling? We offer hints and simpler examples. 
                     Excelling? We serve tougher challenges to keep them growing.
                   </p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                   <Zap className="w-6 h-6 text-amber-300" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Short, Focused Bursts</h3>
                   <p className="text-slate-400 leading-relaxed">
                     Lessons are designed to be completed in 10–15 minutes. 
                     Perfect for building a daily habit without burnout.
                   </p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                   <Layout className="w-6 h-6 text-emerald-300" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Read-Aloud Support</h3>
                   <p className="text-slate-400 leading-relaxed">
                     Every question and prompt can be read aloud. 
                     Crucial for early readers to build independence.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </Container>
      </section>


      {/* 4. PARENT SUPERPOWERS */}
      <section className="py-20">
        <Container>
           <div className="grid lg:grid-cols-12 gap-12 items-center">
             <div className="lg:col-span-5 order-2 lg:order-1">
               <SectionLabel>For Parents</SectionLabel>
               <h2 className="text-4xl font-black text-slate-900 mb-6">Total clarity.<br/>Zero nagging.</h2>
               <p className="text-lg text-slate-600 font-medium mb-8">
                 Stop asking "did you do your homework?" and start celebrating wins. 
                 Our parent dashboard gives you the highlights without the noise.
               </p>

               <div className="grid gap-4">
                 <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4">
                    <BarChart3 className="w-6 h-6 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Weekly Insight Email</div>
                      <div className="text-sm text-slate-600">Get a summary every Monday morning: effort, mastery, and focus areas.</div>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4">
                    <Lock className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Safe & Ad-Free</div>
                      <div className="text-sm text-slate-600">No external links. No chat. No ads. A walled garden for peace of mind.</div>
                    </div>
                 </div>
               </div>
             </div>

             <div className="lg:col-span-7 order-1 lg:order-2">
                <ParallaxImage 
                  src="/illustrations/app/parent-analytics.webp" 
                  alt="Parent Dashboard"
                  className="aspect-[4/3] shadow-emerald-100" 
                />
             </div>
           </div>
        </Container>
      </section>


      {/* 5. TOOLKIT GRID */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900">The Complete Toolkit</h2>
            <p className="text-slate-600 mt-2">More than just lessons. A suite of tools to help them thrive.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <ToolTile icon="🔎" title="Curiosity Explorer" desc="Safe answers to big questions" color="bg-indigo-50 text-indigo-700" />
             <ToolTile icon="🧾" title="Worksheet Generator" desc="Printable practice sheets" color="bg-amber-50 text-amber-700" />
             <ToolTile icon="📖" title="Visual Dictionary" desc="Kid-friendly definitions" color="bg-emerald-50 text-emerald-700" />
             <ToolTile icon="🌍" title="World Explorer" desc="3D globe & culture facts" color="bg-sky-50 text-sky-700" />
             <ToolTile icon="🧘" title="Focus Mode" desc="Distraction-free interface" color="bg-rose-50 text-rose-700" />
             <ToolTile icon="📘" title="Storybook" desc="Turn progress into a book" color="bg-violet-50 text-violet-700" />
             <ToolTile icon="⏳" title="Timeline" desc="Visual history of wins" color="bg-slate-50 text-slate-700" />
             <ToolTile icon="🧠" title="Lesson Builder" desc="Create custom lessons" color="bg-fuchsia-50 text-fuchsia-700" />
          </div>
        </Container>
      </section>

      {/* 6. CTA */}
      <section className="py-24">
        <Container>
          <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden px-8 py-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900 z-0" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                Start their adventure today.
              </h2>
              <p className="text-lg text-slate-300 font-medium mb-10">
                Join thousands of families building confidence with SmartKidz.
                Try it free for 7 days.
              </p>
              <Link 
                href="https://app.smartkidz.app/app/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-slate-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-indigo-50 transition-all"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <p className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                No credit card required for preview
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ToolTile({ icon, title, desc, color }) {
  return (
    <div className={cn("p-6 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg border border-transparent hover:border-slate-100", color)}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-black text-lg leading-tight">{title}</div>
      <div className="text-xs font-bold opacity-70 mt-1 uppercase tracking-wide">{desc}</div>
    </div>
  );
}