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
} from "lucide-react";
import { cx } from "@/components/admin/adminUi";

const GROUPS = [
  {
    title: "Content",
    items: [
      { href: "/admin/builder", label: "Pages", icon: LayoutTemplate },
      { href: "/admin/lesson-builder", label: "Lessons", icon: BookOpen },
      { href: "/admin/workflows", label: "Workflows", icon: Wand2 },
      { href: "/admin/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/media", label: "Media", icon: Image },
      { href: "/admin/theme", label: "Theme", icon: Palette },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, minRole: "root" },
      { href: "/admin/database", label: "Database", icon: Database, minRole: "root" },
      { href: "/admin/github", label: "GitHub Sync", icon: Github, minRole: "root" },
      { href: "/admin/audit", label: "Audit Log", icon: ClipboardList, minRole: "root" },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function roleRank(r) {
  return r === "root" ? 2 : r === "admin" ? 1 : 0;
}

function RootBadge({ active }) {
  return (
    <span
      className={cx(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
        active ? "border-white/30 text-white/90" : "border-slate-200 text-slate-500"
      )}
    >
      ROOT
    </span>
  );
}

function NavRow({ href, label, icon: Icon, active, locked, showRootBadge, onNavigate }) {
  const base =
    "group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition";
  const cls = cx(
    base,
    active
      ? "bg-slate-900 text-white"
      : locked
      ? "opacity-60 cursor-not-allowed"
      : "hover:bg-slate-50"
  );

  const left = (
    <span className="flex items-center gap-2 min-w-0">
      <Icon className={cx("h-4 w-4", active ? "text-white" : "text-slate-500 group-hover:text-slate-900")} />
      <span className="truncate">{label}</span>
    </span>
  );

  if (locked) {
    return (
      <div className={cls} aria-disabled="true" title="Root-only tool">
        {left}
        {showRootBadge ? <RootBadge active={active} /> : null}
      </div>
    );
  }

  return (
    <Link href={href} className={cls} onClick={onNavigate}>
      {left}
      {showRootBadge ? <RootBadge active={active} /> : null}
    </Link>
  );
}

export default function AdminSidebar({ role = "admin" }) {
  const path = usePathname() || "";
  const rr = roleRank(role);

  return (
    <aside className="md:sticky md:top-[84px] h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-3 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Workspace</div>
      </div>

      <nav className="p-2 space-y-3" aria-label="Admin navigation">
        {GROUPS.map((g) => (
          <div key={g.title} className="space-y-1">
            <div className="px-3 pt-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {g.title}
            </div>
            {g.items.map((item) => {
              const isActive = path === item.href || path.startsWith(`${item.href}/`);
              const needs = item.minRole ? roleRank(item.minRole) : 0;
              const locked = rr < needs;
              return (
                <NavRow
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive}
                  locked={locked}
                  showRootBadge={item.minRole === "root"}
                />
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 text-xs text-slate-500">
        Root-only tools are gated by role.
      </div>
    </aside>
  );
}
