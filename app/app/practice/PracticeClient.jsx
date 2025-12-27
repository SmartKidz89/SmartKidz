"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Zap, BrainCircuit, Dumbbell, Target, Timer, ArrowRight, Star } from "lucide-react";
import { useActiveChild } from "@/hooks/useActiveChild";

const MODES = [
  { 
    id: "quick", 
    title: "Quick Mix", 
    desc: "5 random questions to keep you sharp.", 
    icon: Zap, 
    color: "bg-amber-400", 
    gradient: "from-amber-400 to-orange-500",
    time: "2 min" 
  },
  { 
    id: "weakness", 
    title: "Power Up", 
    desc: "Focus on skills that need a boost.", 
    icon: Dumbbell, 
    color: "bg-rose-500", 
    gradient: "from-rose-500 to-pink-600",
    time: "5 min" 
  },
  { 
    id: "math", 
    title: "Maths Gym", 
    desc: "Numbers, shapes, and patterns.", 
    icon: BrainCircuit, 
    color: "bg-sky-500", 
    gradient: "from-sky-400 to-blue-600",
    time: "Unlimited" 
  },
];

export default function PracticeClient() {
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const [selectedMode, setSelectedMode] = useState(null);

  const startPractice = (modeId) => {
    // For now, route to a generic lesson runner or specialized practice runner
    // In a real app, this would generate a specific question set ID
    router.push(`/app/lesson/practice-${modeId}?mode=${modeId}`);
  };

  return (
    <PageMotion className="max-w-5xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-2">
             <Dumbbell className="w-4 h-4" /> Training Center
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">
             Practice Gym
           </h1>
           <p className="text-slate-600 font-medium mt-2 max-w-xl">
             Choose a workout for your brain. Short sessions help you remember more.
           </p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Goal</div>
             <div className="text-sm font-black text-slate-900">15/20 mins</div>
           </div>
           <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center">
             <div className="text-xs font-bold text-emerald-500">75%</div>
           </div>
        </div>
      </div>

      {/* Main Modes Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {MODES.map((m, i) => (
          <button 
            key={m.id}
            onClick={() => startPractice(m.id)}
            className="group relative h-64 rounded-[2.5rem] overflow-hidden text-left shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient}`} />
            <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay" />
            
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
               <m.icon className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
               <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                    <m.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">{m.title}</h3>
                  <p className="text-white/90 font-medium text-sm leading-relaxed">{m.desc}</p>
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                     <Timer className="w-3.5 h-3.5" /> {m.time}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                     <ArrowRight className="w-5 h-5" />
                  </div>
               </div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats / Mastery Section */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
         <Card className="p-8 bg-white border-slate-100">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black text-slate-900">Your Strengths</h3>
               <div className="text-sm font-bold text-indigo-600">View Report</div>
            </div>
            
            <div className="space-y-4">
               {['Number Sense', 'Reading', 'Science Logic'].map((skill, i) => (
                 <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                       <span>{skill}</span>
                       <span>Level {4 - i}</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                         style={{ width: `${90 - (i * 15)}%` }} 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
               <div>
                 <div className="text-amber-400 mb-3">
                    <Star className="w-8 h-8 fill-current" />
                 </div>
                 <h3 className="text-2xl font-black">Daily Challenge</h3>
                 <p className="text-slate-400 text-sm mt-2">
                   Complete a practice session today to keep your 3-day streak alive!
                 </p>
               </div>
               <Button onClick={() => startPractice("quick")} className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold border-none">
                  Start Now
               </Button>
            </div>
         </div>
      </div>

    </PageMotion>
  );
}