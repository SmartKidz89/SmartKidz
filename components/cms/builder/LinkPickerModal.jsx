"use client";

import { useMemo, useState } from "react";
import { 
  Globe, Lock, Layout, Home, Map, Trophy, 
  UserCircle, Settings, BookOpen, Search 
} from "lucide-react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const SYSTEM_ROUTES = [
  // Public / Marketing
  { key: "home", label: "Home", sub: "Public Homepage", href: "/", icon: Home, scope: "public" },
  { key: "m_features", label: "Features", sub: "Marketing", href: "/marketing/features", icon: Globe, scope: "public" },
  { key: "m_curriculum", label: "Curriculum", sub: "Marketing", href: "/marketing/curriculum", icon: BookOpen, scope: "public" },
  { key: "m_pricing", label: "Pricing", sub: "Marketing", href: "/marketing/pricing", icon: Globe, scope: "public" },
  { key: "login", label: "Login", sub: "Auth", href: "/login", icon: Lock, scope: "public" },
  { key: "signup", label: "Signup", sub: "Auth", href: "/signup", icon: Lock, scope: "public" },

  // App / Student
  { key: "app_home", label: "Dashboard", sub: "Student Home", href: "/app", icon: Home, scope: "app" },
  { key: "app_today", label: "Today's Plan", sub: "Daily Missions", href: "/app/today", icon: Layout, scope: "app" },
  { key: "app_worlds", label: "Worlds", sub: "Subject Map", href: "/app/worlds", icon: Map, scope: "app" },
  { key: "app_rewards", label: "Rewards", sub: "Arcade & Shop", href: "/app/rewards", icon: Trophy, scope: "app" },
  { key: "app_avatar", label: "Avatar", sub: "Customizer", href: "/app/avatar", icon: UserCircle, scope: "app" },
  { key: "app_pet", label: "My Pet", sub: "Companion", href: "/app/pet", icon: UserCircle, scope: "app" },

  // App / Parent
  { key: "parent_dash", label: "Parent Dashboard", sub: "Overview", href: "/app/parent", icon: Settings, scope: "parent" },
  { key: "parent_insight", label: "Insights", sub: "Analytics", href: "/app/parent/insights", icon: Settings, scope: "parent" },
  { key: "parent_reports", label: "Reports", sub: "Email Settings", href: "/app/parent/reports", icon: Settings, scope: "parent" },
  { key: "parent_settings", label: "Settings", sub: "Account & Subs", href: "/app/settings", icon: Settings, scope: "parent" },
];

export default function LinkPickerModal({ open, pages = [], value = "", onPick, onClose }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | app | public | cms

  const options = useMemo(() => {
    // 1. Process CMS Pages
    const cmsLinks = (pages || []).map((p) => {
      const href = p.scope === "app" ? `/app/p/${p.slug}` : `/marketing/p/${p.slug}`;
      return {
        key: p.id,
        label: p.title || p.slug,
        sub: `CMS Page (${p.scope})`,
        href,
        icon: FileIcon,
        scope: "cms",
      };
    });

    // 2. Combine with System Routes
    const all = [...SYSTEM_ROUTES, ...cmsLinks];

    // 3. Filter
    const query = q.trim().toLowerCase();
    
    return all.filter((o) => {
      const matchesSearch = !query || (o.label + " " + o.sub + " " + o.href).toLowerCase().includes(query);
      const matchesType = filter === "all" || 
                          (filter === "cms" && o.scope === "cms") ||
                          (filter === "app" && (o.scope === "app" || o.scope === "parent")) ||
                          (filter === "public" && o.scope === "public");
      
      return matchesSearch && matchesType;
    });
  }, [pages, q, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div>
            <div className="text-sm font-bold text-slate-900">Select Destination</div>
            <div className="text-xs text-slate-500">Link to any page in the platform.</div>
          </div>
          <button 
            className="h-8 px-3 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            Esc
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
               placeholder="Search pages or paste URL..."
               value={q}
               onChange={(e) => setQ(e.target.value)}
               autoFocus
             />
             {q.length > 3 && (
               <button 
                 onClick={() => { onPick?.(q); onClose?.(); }}
                 className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg"
               >
                 Use Custom
               </button>
             )}
          </div>
          
          <div className="flex gap-2">
             {["all", "app", "public", "cms"].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cx(
                   "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                   filter === f 
                     ? "bg-slate-900 text-white shadow-md" 
                     : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                 )}
               >
                 {f === "cms" ? "Custom Pages" : f}
               </button>
             ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
          <div className="space-y-1">
            {options.map((o) => {
              const Icon = o.icon;
              const isSelected = value === o.href;
              return (
                <button
                  key={o.key}
                  onClick={() => {
                    onPick?.(o.href);
                    onClose?.();
                  }}
                  className={cx(
                    "w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all group",
                    isSelected 
                      ? "bg-white shadow-md ring-1 ring-indigo-500/20 z-10" 
                      : "hover:bg-white hover:shadow-sm"
                  )}
                >
                  <div className={cx(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-indigo-50 text-indigo-600" : "bg-white border border-slate-200 text-slate-400 group-hover:text-slate-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                       <span className={cx("text-sm font-bold", isSelected ? "text-indigo-900" : "text-slate-900")}>
                         {o.label}
                       </span>
                       <span className={cx(
                         "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border",
                         o.scope === "app" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                         o.scope === "parent" ? "bg-slate-100 border-slate-200 text-slate-600" :
                         o.scope === "cms" ? "bg-amber-50 border-amber-100 text-amber-700" :
                         "bg-emerald-50 border-emerald-100 text-emerald-700"
                       )}>
                         {o.scope}
                       </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{o.href}</div>
                  </div>

                  <div className="text-xs font-medium text-slate-400">
                    {o.sub}
                  </div>
                </button>
              );
            })}

            {options.length === 0 && (
               <div className="p-8 text-center text-slate-400 text-sm">
                  No pages match your search.
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function FileIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
  )
}