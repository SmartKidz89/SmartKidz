"use client";

import Link from "next/link";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

const ITEMS = [
  { title: "Today", desc: "Daily quests and quick wins", href: "/app/today", icon: "📅" },
  { title: "Worlds", desc: "Choose a learning world", href: "/app/worlds", icon: "🗺️" },
  { title: "Rewards", desc: "Level up, streaks and season pass", href: "/app/rewards", icon: "🎁" },
  { title: "Avatar", desc: "Spend coins and customise", href: "/app/avatar", icon: "🧸" },
  { title: "My Pet", desc: "Feed and play with your pet", href: "/app/pet", icon: "🐾" },
  { title: "Recommended Next", desc: "Personalised next steps", href: "/app/recommendations", icon: "✨" },
  { title: "Collection", desc: "Your sticker book", href: "/app/collection", icon: "📒" },
  { title: "Parents", desc: "Insights and reports", href: "/app/parent", icon: "👨‍👩‍👧‍👦" },
];

export default function MenuPage() {
  const router = useRouter();
  return (
    <PageMotion className="max-w-4xl mx-auto">
      <div className="skz-glass skz-border-animate skz-shine p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Navigate</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Menu</h1>
            <div className="mt-1 text-slate-600 text-sm">
              Everything in one place so kids (and parents) can move around instantly.
            </div>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => router.back()} data-testid="menu-back">
            Back
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ITEMS.map((it) => (
            <Link key={it.href} href={it.href} className="skz-pressable" data-testid={`menu-link-${it.href.replace(/\//g, "-")}`}>
              <Card className="p-4 rounded-2xl border border-white/20 bg-white/60 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{it.icon}</div>
                  <div>
                    <div className="font-bold">{it.title}</div>
                    <div className="text-sm text-slate-600 mt-0.5">{it.desc}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageMotion>
  );
}