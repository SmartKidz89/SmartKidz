"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useActiveChild } from "@/hooks/useActiveChild";
import { recommendNext } from "@/lib/mastery/recommendations";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";

export default function RecommendationsPanel() {
  const { activeChild } = useActiveChild();

  const rec = useMemo(() => {
    const year = Number(activeChild?.year_level || 1);
    return recommendNext({ subject: activeChild?.subject_pref || "maths", yearLevel: year });
  }, [activeChild]);

  if (!activeChild) {
    return <div className="text-sm opacity-80">Select a child profile to get personalised recommendations.</div>;
  }

  if (!rec.lesson) {
    return <div className="text-sm opacity-80">No recommended lesson found yet. Try completing a lesson first.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>Next up</Pill>
        {rec.weakestSkill?.label ? <Pill tone="muted">Focus: {rec.weakestSkill.label}</Pill> : null}
      </div>

      <div className="text-lg font-semibold">{rec.lesson.title}</div>
      <div className="text-sm opacity-80">{rec.lesson.topic}</div>

      <div className="flex gap-2">
        <Link href={`/app/lesson/${rec.lesson.id}`}>
          <Button className="skz-pressable">Start Lesson</Button>
        </Link>
        <Link href="/app/worlds">
          <Button variant="secondary" className="skz-pressable">Browse Worlds</Button>
        </Link>
      </div>
    </div>
  );
}
