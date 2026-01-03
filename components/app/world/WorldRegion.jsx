"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { MathMountains } from "@/components/app/world/worlds/MathMountains";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function WorldRegion({ worldId }) {
  const router = useRouter();

  if (worldId === "math") {
    return <MathMountains />;
  }

  // Placeholder for other worlds (keeps routing stable).
  const name =
    worldId === "reading"
      ? "Reading River"
      : worldId === "science"
      ? "Science Forest"
      : worldId === "reflect"
      ? "Reflection Garden"
      : "World";

  return (
    <div className="relative min-h-screen bg-[radial-gradient(900px_500px_at_15%_10%,rgba(99,102,241,0.20),transparent_60%),linear-gradient(to_bottom,#eef2ff,#f8fafc)]">
      <HomeCloud to="/app" label="World Map" />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-600">World</div>
            <div className="text-3xl font-extrabold text-slate-900">{name}</div>
          </div>
          <Badge variant="brand">Coming next</Badge>
        </div>

        <Card className="mt-6 p-6">
          <div className="text-base font-semibold text-slate-900">
            This world is on the way.
          </div>
          <p className="mt-2 text-sm text-slate-600">
            The navigation shell is in place. Next we’ll add the themed map,
            lesson nodes, and progress visuals for this world.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button theme="kid" onClick={() => router.push("/app")}>
              Back to map
            </Button>
            <Button theme="kid" variant="secondary" onClick={() => router.push("/app/world/math")}>
              Explore Math Mountains
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
