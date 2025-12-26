'use client';

import Link from "next/link";
import Image from "next/image";
import { WORLDS } from "@/data/worlds";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";
const TILE_ICON_BY_WORLD = {
  math: "/tiles/math.svg",
  reading: "/tiles/reading.svg",
  science: "/tiles/science.svg",
  energy: "/tiles/energy.svg",
};

export default function WorldsPage() {
  return (
    <PageScaffold title="Worlds" subtitle="Choose a world to start learning.">
      <BentoGrid>
        {Object.values(WORLDS).map((world) => (
          <BentoCard key={world.id}>
            <Link
              href={`/app/world/${world.id}`}
              className="block rounded-2xl p-4 hover:bg-muted/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-muted overflow-hidden">
                  <Image
                    src={TILE_ICON_BY_WORLD[world.id] || "/tiles/rocket.svg"}
                    alt={world.title}
                    fill
                    className="object-contain p-2"
                    priority={false}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">{world.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{world.description}</div>
                </div>
              </div>
            </Link>
          </BentoCard>
        ))}
      </BentoGrid>
    </PageScaffold>
  );
}
