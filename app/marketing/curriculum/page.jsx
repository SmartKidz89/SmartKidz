"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calculator, BookOpen, FlaskConical, Globe, Palette, 
  Cpu, Activity, Languages, CheckCircle2, GraduationCap, 
  ArrowRight, Layers, Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";

// --- Components ---

function Container({ children, className = "" }) {
  return <div className={cn("container-pad px-6", className)}>{children}</div>;
}

function SubjectCard({ id, title, subtitle, icon: Icon, color, gradient, img, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      <div className="absolute inset-0 z-0">
        <Image src={img} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-70", gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-end min-h-[280px]">
        <div className="absolute top-6 left-6 h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h3 className="text-2xl font-black text-white mb-1">{title}</h3>
          <p className="text-white/90 font-medium text-sm">{subtitle}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            View Curriculum <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ValueProp({ icon: Icon, title, desc, color }) {
  return (
    <div className="flex gap-5">
      <div className={cn("shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", color)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// --- Data ---

const CORE_SUBJECTS = [
  { 
    id: "MATH", title: "Mathematics", subtitle: "Number, Algebra, Geometry, Statistics",
    icon: Calculator, gradient: "from-sky-400 to-blue-600", img: "/illustrations/subjects/world-maths.webp" 
  },
  { 
    id: "ENG", title: "English", subtitle: "Reading, Writing, Speaking, Listening",
    icon: BookOpen, gradient: "from-violet-400 to-fuchsia-600", img: "/illustrations/subjects/world-english.webp" 
  },
  { 
    id: "SCI", title: "Science", subtitle: "Biological, Chemical, Earth, Physical",
    icon: FlaskConical, gradient: "from-emerald-400 to-teal-600", img: "/illustrations/subjects/world-science.webp" 
  },
];

const WIDER_WORLD = [
  { id: "HASS", title: "HASS", icon: Globe, color: "bg-amber-100 text-amber-700" },
  { id: "ART", title: "The Arts", icon: Palette, color: "bg-pink-100 text-pink-700" },
  { id: "TECH", title: "Technologies", icon: Cpu, color: "bg-slate-100 text-slate-700" },
  { id: "HPE", title: "Health & PE", icon: Activity, color: "bg-lime-100 text-lime-700" },
  { id: "LANG", title: "Languages", icon: Languages, color: "bg-indigo-100 text-indigo-700" },
];

export default function CurriculumPage() {
  return (
    <PageScaffold title={null} className="bg-slate-50/50">
      <CinematicScroll>
        
        {/* 1. HERO */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-sky-100/40 via-emerald-100/20 to-transparent rounded-full blur-[100px] -z-10" />
          
          <Container className="text-center max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm backdrop-blur-md mb-6"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Standard Aligned • Kid Approved
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6"
            >
              The full Australian Curriculum. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-600">
                Hidden inside a game.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              We cover every key learning area from Prep to Year 6. 
              Structured for mastery, designed for fun.
            </motion.p>
          </Container>

          {/* Hero Visual */}
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[21/9]"
            >
              <Image 
                src="/illustrations/scenes/curriculum-hero.webp" 
                alt="Curriculum Overview" 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 text-white">
                <div className="inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                  Preview
                </div>
                <div className="text-2xl sm:text-3xl font-black">Explore the Learning Map</div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* 2. THE CORE THREE */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">The Core Three</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Deep, adaptive worlds for the subjects that matter most. 
                Complete with lessons, quizzes, and hands-on activities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CORE_SUBJECTS.map((sub, i) => (
                <SubjectCard key={sub.id} {...sub} delay={i * 0.1} />
              ))}
            </div>
          </Container>
        </section>

        {/* 3. PEDAGOGY SECTION */}
        <section className="py-24 bg-white border-y border-slate-100">
          <Container>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
                  Not just content.<br/>
                  <span className="text-indigo-600">Smart pedagogy.</span>
                </h2>
                <div className="space-y-10">
                  <ValueProp 
                    icon={Layers} 
                    title="Spiral Learning" 
                    desc="We revisit key concepts at increasing levels of difficulty over time. This 'spacing effect' helps move knowledge from short-term to long-term memory."
                    color="bg-indigo-500"
                  />
                  <ValueProp 
                    icon={Repeat} 
                    title="Mastery Loops" 
                    desc="Kids can't fail. If they struggle, we offer hints and simpler questions. If they succeed, we nudge them to the next level. Confidence comes from competence."
                    color="bg-rose-500"
                  />
                  <ValueProp 
                    icon={CheckCircle2} 
                    title="Curriculum Mapped" 
                    desc="Every lesson is tagged to specific Australian Curriculum codes (AC9). You can trust that their screen time is actually school time."
                    color="bg-emerald-500"
                  />
                </div>
              </div>

              {/* Visual Side */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-rose-50 rounded-[3rem] transform rotate-3" />
                <div className="relative bg-slate-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <div className="relative z-10">
                    <div className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Example: Year 3 Maths</div>
                    <div className="text-3xl font-black mb-8">Fractions</div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <div className="font-bold">Concept: Halves & Quarters</div>
                          <div className="text-sm text-slate-300">Visual models (pizza, shapes)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <div className="font-bold">Practice: Sorting</div>
                          <div className="text-sm text-slate-300">Is it equal parts? Yes/No</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 opacity-70">
                        <div className="h-8 w-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <div className="font-bold">Challenge: Number Line</div>
                          <div className="text-sm text-slate-300">Place 1/2 on the line</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 4. THE WIDER WORLD */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Plus the wider world</h2>
              <p className="text-lg text-slate-600">A complete education includes more than just the basics.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {WIDER_WORLD.map((w) => (
                <div 
                  key={w.id} 
                  className={cn("flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-default select-none")}
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", w.color)}>
                    <w.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800">{w.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block p-6 rounded-3xl bg-indigo-50 border border-indigo-100 max-w-2xl">
                <h3 className="font-bold text-indigo-900 mb-2">Did you know?</h3>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  We are also adding <strong>Digital Technologies</strong> (Coding basics) and <strong>Aboriginal & Torres Strait Islander Histories</strong> modules this year. SmartKidz grows with the curriculum.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* 5. CTA */}
        <section className="py-24">
          <Container>
            <div className="relative rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden px-8 py-20 text-center">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[100px]" />
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                  Ready to give them a head start?
                </h2>
                <p className="text-lg text-slate-300 font-medium mb-10">
                  Join thousands of families building confidence with SmartKidz.
                  Full curriculum access included in every plan.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href="https://app.smartkidz.app/app/signup"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-slate-900 shadow-xl hover:scale-105 hover:bg-indigo-50 transition-all"
                  >
                    Start Free Trial
                  </Link>
                  <Link 
                    href="/marketing/pricing"
                    className="inline-flex h-14 items-center justify-center rounded-full px-8 text-lg font-bold text-white border-2 border-slate-700 hover:bg-slate-800 transition-all"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </CinematicScroll>
    </PageScaffold>
  );
}