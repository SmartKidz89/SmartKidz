"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CandyCard } from "@/components/ui/CandyCard";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useSelectedYear } from "@/hooks/useSelectedYear";
import { Page, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

const WORLDS = [
  { id: "MAT", slug: "maths", title: "Maths", subtitle: "Numbers and patterns", img: "/illustrations/subjects/world-maths.webp", emoji: "📐" },
  { id: "ENG", slug: "english", title: "English", subtitle: "Reading and writing", img: "/illustrations/subjects/world-english.webp", emoji: "📚" },
  { id: "SCI", slug: "science", title: "Science", subtitle: "Experiments and discovery", img: "/illustrations/subjects/world-science.webp", emoji: "🧪" },
  { id: "HASS", slug: "hass", title: "HASS", subtitle: "People and places", img: "/illustrations/subjects/world-energy.webp", emoji: "🗺️" },
  { id: "HPE", slug: "hpe", title: "HPE", subtitle: "Health and movement", img: "/illustrations/subjects/world-health.webp", emoji: "🏃" },
  { id: "ARTS", slug: "arts", title: "The Arts", subtitle: "Create and perform", img: "/illustrations/subjects/world-arts.webp", emoji: "🎨" }
];

export default function WorldsPage() {
  const { activeChild } = useActiveChild();
  const { year } = useSelectedYear();

  const title = useMemo(() => {
    const name = activeChild?.display_name || "Explorer";
    return `Choose a World, ${name}`;
  }, [activeChild?.display_name]);

  return (
    <Page
      badge="Worlds"
      title={title}
      subtitle={`Pick a subject world. We’ll tailor lessons for Year ${year ?? "—"}.`}
    >
      <BentoGrid>
        <BentoCard className="col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORLDS.map((w) => (
              <Link key={w.id} href={`/app/${w.slug}`} className="block">
                <CandyCard className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold tracking-wide text-slate-500">WORLD</div>
                      <div className="mt-1 text-2xl font-black text-slate-900 flex items-center gap-2">
                        <span aria-hidden>{w.emoji}</span>
                        <span>{w.title}</span>
                      </div>
                      <div className="text-slate-700 mt-1">{w.subtitle}</div>
                    </div>
                    <div className="text-xl">➜</div>
                  </div>

                  <div className="mt-4 rounded-3xl overflow-hidden border border-white/70 bg-white/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.img} alt="" className="w-full h-32 object-cover" />
                  </div>
                </CandyCard>
              </Link>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </Page>
  );
}
