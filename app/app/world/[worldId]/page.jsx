"use client";

import { WorldRegion } from "@/components/app/world/WorldRegion";

export default function WorldPage({ params }) {
  return <WorldRegion worldId={params.worldId} />;
}
