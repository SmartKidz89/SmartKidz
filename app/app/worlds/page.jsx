"use client";

import Link from "next/link";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

/**
 * Single source of truth for World tiles.
 * These world IDs must match the ones handled by <WorldRegion />.
 */
const WORLDS = [
  {
    id: "math",
    title: "Math World",
    subtitle: "Numbers, patterns, and problem-solving.",
    img: "/illustrations/subjects/world-maths.png",
  },
  {
    id: "english",
    title: "English World",
    subtitle: "Vocabulary, writing, and communication.",
    img: "/illustrations/subjects/world-english.png",
  },
  {
    id: "science",
    title: "Science World",
    subtitle: "Experiments, discovery, and curiosity.",
    img: "/illustrations/subjects/world-science.png",
  },
  {
    id: "creativity",
    title: "Creativity World",
    subtitle: "Art, music, and imagination.",
    img: "/illustrations/subjects/world-arts.png",
  },
  {
    id: "mindfulness",
    title: "Mindfulness World",
    subtitle: "Calm, focus, and wellbeing.",
    img: "/illustrations/subjects/world-health.png",
  },
  {
    id: "coding",
    title: "Coding World",
    subtitle: "Logic, building, and playful programming.",
    img: "/illustrations/subjects/world-energy.png",
  },
];

export default function WorldsPage() {
  return (
    <PageScaffold
      title="Worlds"
      subtitle="Choose a world to start learning."
      badge="Explore"
    >
      <BentoGrid>
        {WORLDS.map((world) => (
          <BentoCard
            key={world.id}
            title={world.title}
            subtitle={world.subtitle}
            img={world.img}
            actions={
              <Link
                href={`/app/world/${world.id}`}
                className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-sm font-medium text-white"
              >
                Open
              </Link>
            }
          />
        ))}
      </BentoGrid>
    </PageScaffold>
  );
}
