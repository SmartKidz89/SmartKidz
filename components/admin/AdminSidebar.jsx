"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutTemplate,
  Wand2,
  Navigation,
  Image,
  Palette,
  Users,
  Database,
  Github,
  ClipboardList,
  Settings,
  Factory,
  Mail,
  Activity,
  ShieldAlert
} from "lucide-react";
import { cx } from "@/components/admin/adminUi";

const GROUPS = [
  {
    title: "Content Engine",
    items: [
      { href: "/admin/builder", label: "Page Builder", icon: LayoutTemplate },
      { href: "/admin/lesson-builder", label: "Lesson Factory", icon: BookOpen },
      { href: "/admin/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/media", label: "Media Library", icon: Image },
      { href: "/admin/media/generator", label: "Asset Generator", icon: Factory },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/communications", label: "Communications", icon: Mail },
      { href: "/admin/system", label: "System & Ops", icon: Activity },
      { href: "/admin/users", label: "Users & Roles", icon: Users, minRole: "root" },
      { href: "/admin/audit", label: "Audit Log", icon: ClipboardList, minRole: "root" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/theme", label: "Theme & Brand", icon: Palette },
      { href: "/admin/workflows", label: "AI Workflows", icon: Wand2 },
      { href: "/admin/settings", label: "Global Settings", icon: Settings },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { href: "/admin/database", label: "Database SQL", icon: Database, minRole: "root" },
      { href: "/admin/github", label: "GitHub Sync", icon: Github, minRole: "root" },
    ],
  },
];

function roleRank(r) {
  return r === "root" ? 2 : r === "admin" ? 1 : 0;
}

function NavRow({ href, label, icon: Icon, active, locked, minRole }) {
  return (
    <Link 
      href={href} 
      className={cx(
        "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
        active 
          ? "bg-slate-900 text-white shadow-md" 
          : locked
          ? "opacity-40 cursor-not-allowed pointer-events-none"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
      aria-disabled={locked}
    >
      <div className="flex items-center gap-3">
        <Icon className={cx("w-4 h-4", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={2.5} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {minRole === "root" && !locked && (
        <span className={cx(
          "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
        )}>
          Root
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar({ role = "admin" }) {
  const path = usePathname() || "";
  const rr = roleRank(role);

  return (
    <nav className="space-y-8">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="px-3 mb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {g.title}
          </div>
          <div className="space-y-0.5">
            {g.items.map((item) => {
              const isActive = path === item.href || path.startsWith(`${item.href}/`);
              const needs = item.minRole ? roleRank(item.minRole) : 0;
              const locked = rr < needs;
              
              return (
                <NavRow
                  key={item.href}
                  {...item}
                  active={isActive}
                  locked={locked}
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}