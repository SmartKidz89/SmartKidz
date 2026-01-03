"use client";

import { useParams, useRouter } from "next/navigation";
import { MathFractionBridgeLesson } from "@/components/app/lesson/lessons/mathFractionBridge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  
  const worldId = params?.worldId;
  const lessonId = params?.lessonId;

  if (worldId === "math" && (lessonId === "fraction-pass" || lessonId === "number-bridge")) {
    return <MathFractionBridgeLesson />;
  }

  // Generic fallback lesson shell
  return (
    <PageScaffold title={`Lesson: ${lessonId || "..."}`}>
      <div className="relative min-h-screen bg-[radial-gradient(900px_500px_at_20%_10%,rgba(56,189,248,0.25),transparent_60%),linear-gradient(to_bottom,#f0f9ff,#ffffff)]">
        <HomeCloud to={`/app/world/${worldId}`} label="Back to world" />
        <div className="mx-auto max-w-3xl px-5 py-10">
          <Card className="p-6">
            <div className="text-xl font-extrabold text-slate-900">
              Lesson: {lessonId}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              This lesson is a placeholder. Next we’ll plug in the full quest mechanic and rewards.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button theme="kid" onClick={() => router.push(`/app/world/${worldId}`)}>
                Return to path
              </Button>
              <Button theme="kid" variant="secondary" onClick={() => router.push("/app")}>
                World map
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}