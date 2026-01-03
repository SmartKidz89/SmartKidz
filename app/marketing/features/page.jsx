"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Map, Trophy, Shield, Sparkles, Zap, Brain, 
  BarChart3, Globe, Lock, BookOpen,
  Palette, Calculator, FlaskConical, Smile,
  CheckCircle2, ArrowRight, Layers, Repeat, Globe2, PenTool, Lightbulb, Volume2
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
function ParallaxImage({ src, alt, className, fit = "cover" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  // Gentler parallax for "contain" images to keep them framed nicely
  const yRange = fit === "contain" ? ["0%", "5%"] : ["0%", "15%"];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1, 1.02]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-900/5 bg-slate-100", className)}>
      <motion.div style={{ y, scale }} className="absolute inset-0 w-full h-full">
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className={cn("transition-transform duration-700", fit === "contain" ? "object-contain p-4" : "object-cover")}
        />
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
        
        <Container className="text-center max-w-4xl relative z-10">
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
                className="aspect-[16/10] bg-indigo-50"
                fit="contain" 
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

      {/* 3. CREATIVE STUDIO SHOWCASE (New) */}
      <section className="py-24 bg-white border-y border-slate-100 overflow-hidden">
        <Container>
          <div className="text-center mb-16">
             <SectionLabel>Creative Studio</SectionLabel>
             <h2 className="text-4xl font-black text-slate-900 mb-4">Projects for the Imagination</h2>
             <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
               We believe creativity is a core skill. That’s why SmartKidz includes premium creative projects and guided activities to help kids express themselves.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Storybook */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="rounded-[2.5rem] bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-8 shadow-lg"
             >
                <div className="w-14 h-14 rounded-2xl bg-violet-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-violet-200 mb-6">
                   <PenTool className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Magic Storybook</h3>
                <p className="text-slate-600 font-medium mb-6">
                  Kids write a prompt, and our safe AI helps them generate a full illustrated storybook they can read and share.
                </p>
                <div className="relative h-44 rounded-2xl bg-white border border-violet-100 overflow-hidden shadow-sm">
                   {/* Abstract book lines */}
                   <div className="absolute top-4 left-4 right-4 h-2 bg-violet-100 rounded-full" />
                   <div className="absolute top-8 left-4 right-12 h-2 bg-violet-50 rounded-full" />
                   <div className="absolute bottom-4 right-4 w-12 h-12 bg-violet-500 rounded-full opacity-10" />
                </div>
             </motion.div>

             {/* World Explorer */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="rounded-[2.5rem] bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-8 shadow-lg"
             >
                <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-sky-200 mb-6">
                   <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">World Explorer</h3>
                <p className="text-slate-600 font-medium mb-6">
                  Tap any flag to teleport instantly. Discover local foods, greetings, landmarks, and animals from 195+ countries.
                </p>
                <div className="flex gap-2 justify-center py-4 opacity-80">
                   <span className="text-4xl">🇦🇺</span>
                   <span className="text-4xl">🇯🇵</span>
                   <span className="text-4xl">🇫🇷</span>
                   <span className="text-4xl">🇧🇷</span>
                </div>
             </motion.div>

             {/* Curiosity Engine */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-2 lg:col-span-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 shadow-lg"
             >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 mb-6">
                   <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Curiosity Engine</h3>
                <p className="text-slate-600 font-medium mb-6">
                  "Why is the sky blue?" Our kid-safe AI answers any question with simple language, a quiz, and a real-world experiment.
                </p>
                <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm text-xs font-mono text-indigo-400">
                   &gt; Asking... <br/>
                   &gt; Found answer! <br/>
                   &gt; Generating quiz...
                </div>
             </motion.div>
          </div>
        </Container>
      </section>

      {/* 4. THE LEARNING ENGINE (Dark/Contrast Section) */}
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
                className="aspect-square border-white/10 shadow-indigo-900/50 bg-slate-800"
                fit="contain" 
              />
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
                   <Volume2 className="w-6 h-6 text-emerald-300" />
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


      {/* 5. PARENT SUPERPOWERS */}
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
                  className="aspect-[4/3] shadow-emerald-100 bg-white" 
                  fit="contain"
                />
             </div>
           </div>
        </Container>
      </section>
    </div>
  );
}