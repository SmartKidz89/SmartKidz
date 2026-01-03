"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import TodayModule from "@/components/today/TodayModule";
import RecommendationsPanel from "@/components/app/RecommendationsPanel";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { 
  Calculator, BookOpen, FlaskConical, Globe, Palette, Cpu, Activity, Languages, 
  Star, Zap, Map, Sparkles, Heart,
  Globe2, PenTool, Compass, Plus, Palette as PaletteIcon, Clock, AlertCircle, RotateCcw,
  Wifi, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGeoConfig } from "@/lib/marketing/geoConfig";

// --- Configuration ---

function getSubjects(geo) {
  return [
    { 
      id: "MATH", title: geo.mathTerm, subtitle: "Numbers & Logic", icon: Calculator, color: "text-sky-600", bg: "bg-sky-50", gradient: "from-sky-400 to-blue-600", img: "/illustrations/subjects/world-maths.webp" 
    },
    { 
      id: "ENG", title: "English", subtitle: "Reading & Writing", icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-400 to-fuchsia-600", img: "/illustrations/subjects/world-english.webp" 
    },
    { 
      id: "SCI", title: "Science", subtitle: "Discovery Lab", icon: FlaskConical, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-400 to-teal-600", img: "/illustrations/subjects/world-science.webp" 
    },
    { 
      id: "HASS", title: geo.hassTerm, subtitle: "History & World", icon: Globe, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-400 to-orange-600", img: "/illustrations/subjects/world-energy.webp" 
    },
    { 
      id: "ART", title: "The Arts", subtitle: "Create & Express", icon: Palette, color: "text-pink-600", bg: "bg-pink-50", gradient: "from-pink-400 to-rose-600", img: "/illustrations/subjects/world-arts.webp" 
    },
    { 
      id: "TECH", title: "Technologies", subtitle: "Design & Code", icon: Cpu, color: "text-slate-600", bg: "bg-slate-50", gradient: "from-slate-400 to-slate-600", img: "/illustrations/subjects/world-energy.webp" 
    },
    { 
      id: "HPE", title: geo.code === "US" ? "Health & PE" : "HPE", subtitle: "Active Bodies", icon: Activity, color: "text-lime-600", bg: "bg-lime-50", gradient: "from-lime-400 to-green-600", img: "/illustrations/subjects/world-health.webp" 
    },
    { 
      id: "LANG", title: "Languages", subtitle: "Global Talk", icon: Languages, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-400 to-cyan-600", img: "/illustrations/subjects/world-languages.webp" 
    },
  ];
}

// Note: The student app no longer exposes standalone “Tools”.

function Greeting({ name }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{name}</span>!
      </h1>
      <p className="text-slate-600 font-medium mt-1">Ready to discover something new?</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 rounded-3xl bg-white/70 border border-white/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]"
    >
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", colorClass)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-xl font-black text-slate-900">{value}</div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <PageScaffold title={null} className="pb-20 animate-pulse">
       <div className="h-16 w-64 bg-slate-200 rounded-3xl mb-8" />
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 h-80 bg-slate-200 rounded-[2.5rem]" />
          <div className="lg:col-span-4 h-80 bg-slate-200 rounded-[2.5rem]" />
       </div>
    </PageScaffold>
  );
}

function EmptyState() {
  const [dbStatus, setDbStatus] = useState("checking");
  const supabase = getSupabaseClient();

  useEffect(() => {
    supabase.from("subjects").select("count", { count: "exact", head: true })
      .then(({ error }) => setDbStatus(error ? "error" : "online"))
      .catch(() => setDbStatus("error"));
  }, [supabase]);

  return (
    <PageScaffold title={null}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 text-4xl">
           👋
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome to SmartKidz!</h1>
        <p className="text-slate-600 font-medium max-w-md mb-8">
           You aren't logged in yet, so we can't show your child's progress. 
           Sign in to access the full dashboard.
        </p>
        
        <div className="flex gap-4">
           <Link href="/app/onboarding">
              <div className="h-14 px-8 rounded-full bg-slate-900 text-white text-lg font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                 <Plus className="w-5 h-5" /> Create Profile
              </div>
           </Link>
           <Link href="/app/login">
              <div className="h-14 px-8 rounded-full bg-white border border-slate-200 text-slate-900 text-lg font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-transform">
                 Log In
              </div>
           </Link>
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
           {dbStatus === "checking" && <><Loader2 className="w-3 h-3 animate-spin" /> Checking Connection...</>}
           {dbStatus === "online" && <><Wifi className="w-3 h-3 text-emerald-500" /> System Online</>}
           {dbStatus === "error" && <><WifiOff className="w-3 h-3 text-rose-500" /> Connection Issue</>}
        </div>
      </div>
    </PageScaffold>
  );
}

function Loader2(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> }

function ErrorState({ error }) {
  return (
    <PageScaffold title={null}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center shadow-inner mb-6 text-rose-500">
           <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 font-medium max-w-md mb-6 break-words bg-slate-50 p-4 rounded-xl text-xs font-mono">
           {error}
        </p>
        <button onClick={() => window.location.reload()} className="h-12 px-6 rounded-full bg-white border border-slate-200 text-slate-900 font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2">
           <RotateCcw className="w-4 h-4" /> Reload
        </button>
      </div>
    </PageScaffold>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  
  // Safe hook usage
  let activeChild, loading, kids, error;
  try {
    const res = useActiveChild();
    activeChild = res.activeChild;
    loading = res.loading;
    kids = res.kids;
    error = res.error;
  } catch (e) {
    return <EmptyState />;
  }
  
  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!activeChild && (!kids || kids.length === 0)) return <EmptyState />;

  const name = activeChild?.display_name?.split(" ")[0] || "Explorer";
  const geo = getGeoConfig(activeChild?.country || "AU");
  const SUBJECTS = getSubjects(geo);

  return (
    <PageScaffold title={null} className="pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <Greeting name={name} />
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/app/themes")}
            className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
            title="Change Theme"
          >
             <PaletteIcon className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center gap-3">
            <StatCard label="Daily Streak" value="3 Days" icon={Zap} colorClass="bg-amber-400" delay={0.1} />
            <StatCard label="Weekly XP" value="120 XP" icon={Star} colorClass="bg-brand-primary" delay={0.2} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl border border-slate-100 p-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 opacity-50" />
          <ErrorBoundary>
            <TodayModule /> 
          </ErrorBoundary>
        </motion.div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <Link href="/app/worlds" className="block">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[2.5rem] bg-gradient-to-br from-sky-100 to-white border border-sky-100 p-6 shadow-lg relative overflow-hidden group"
            >
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-sky-200/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
               <div className="relative z-10 flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                       <Map className="w-5 h-5 text-sky-600" />
                       <span className="text-xs font-black uppercase tracking-wider text-sky-700">Start</span>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900">Pick a World</h3>
                     <p className="text-xs text-slate-600 font-medium mt-1">Jump into Maths, English, Science and more.</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm group-hover:rotate-12 transition-transform">
                     🌍
                  </div>
               </div>
            </motion.div>
          </Link>

          <Link href="/app/pet" className="block flex-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full rounded-[2.5rem] bg-gradient-to-br from-rose-100 to-white border border-rose-100 p-6 shadow-lg relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all"
            >
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-200/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
               <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-rose-600">Companion</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">My Pet</h3>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-4xl shadow-sm group-hover:rotate-12 transition-transform">
                       🐾
                    </div>
                    <div className="text-sm font-medium text-slate-600 leading-snug">
                       Feed & play!
                    </div>
                 </div>
               </div>
            </motion.div>
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md transform -rotate-3">
              <Map className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your Worlds</h2>
          </div>
          <Link href="/app/worlds" className="text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-brand-primary hover:border-brand-primary transition-all">
            See All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUBJECTS.slice(0, 4).map((sub, idx) => (
            <WorldCard key={sub.id} subject={sub} index={idx} />
          ))}
        </div>
      </section>
      
      <section className="mb-12">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-white/80 border border-white/60 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h3 className="font-extrabold text-slate-900">Recommended For You</h3>
            </div>
            <ErrorBoundary>
              <RecommendationsPanel />
            </ErrorBoundary>
          </motion.div>
      </section>

      <section className="pb-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-slate-900">Quick Links</h2>
          <div className="h-1.5 w-16 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink href="/app/worlds" title="Explore Worlds" subtitle="Start learning" emoji="🧭" />
          <QuickLink href="/app/rewards" title="Rewards" subtitle="Earn and unlock" emoji="🏆" />
          <QuickLink href="/app/avatar" title="Avatar" subtitle="Customize your look" emoji="🧑‍🚀" />
        </div>
      </section>

    </PageScaffold>
  );
}

function ErrorBoundary({ children }) {
  try {
    return <>{children}</>;
  } catch (e) {
    return <div className="text-sm text-slate-500 p-4">Content unavailable</div>;
  }
}

function WorldCard({ subject, index }) {
  return (
    <Link href={`/app/world/${subject.id}`} className="group relative block h-56 w-full cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-white shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      >
        <div className="absolute inset-0">
          <Image src={subject.img} alt={subject.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-95" />
          <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-60 mix-blend-multiply transition-opacity group-hover:opacity-50`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <subject.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white leading-none tracking-tight mb-1 drop-shadow-sm">{subject.title}</h3>
            <p className="text-sm font-medium text-white/90">{subject.subtitle}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function QuickLink({ href, title, subtitle, emoji }) {
  return (
    <Link href={href} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-[2rem] border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
            {emoji}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 truncate">{title}</div>
            <div className="text-xs font-semibold text-slate-500 truncate">{subtitle}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}