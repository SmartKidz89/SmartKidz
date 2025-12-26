"use client";

import { useWeeklyReflection } from "@/components/ui/useEmotionalMoments";
import TrustBar from "@/components/ui/TrustBar";
import ParentInsightCard from "@/components/ui/ParentInsightCard";

import { useRouter } from "next/navigation";
import { useActiveChild } from "@/hooks/useActiveChild";
import ParentInsightsDashboard from "@/components/parent/ParentInsightsDashboard";
import AvatarBadge from "@/components/app/AvatarBadge";
import { Page, BentoGrid, BentoCard, Divider } from "@/components/ui/PageScaffold";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ParentHome() {
  useWeeklyReflection({ childId: null, childName: "your child" });
  const router = useRouter();
  const { kids, setActiveChild, loading, error } = useActiveChild();

  function openKid(kidId) {
    setActiveChild(kidId);
    router.push("/app");
  }

  return (
    <PageScaffold
      badge="Parent"
      title="Parent Dashboard"
      subtitle="Track progress, celebrate wins, and keep learning safe and structured."
      actions={
        <Button variant="secondary" onClick={() => router.push("/app/settings")}>
          Settings
        </Button>
      }
    >
      <BentoGrid>
        <BentoCard className="col-span-12 lg:col-span-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl font-black text-slate-900">Choose a child</div>
              <div className="text-slate-700 mt-1">Tap a profile to jump into their world.</div>
            </div>
            <TrustBar />
          </div>

          <Divider />

          {loading && (
            <div className="text-slate-700 font-semibold">
              Loading profiles…
              <span className="ml-2 inline-block skz-float">✨</span>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-white/60 border border-white/70 p-4 text-slate-800">
              <div className="font-extrabold">We couldn’t load profiles.</div>
              <div className="text-sm text-slate-600 mt-1">{String(error)}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(kids || []).map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => openKid(kid.id)}
                  className={cn(
                    "group text-left w-full skz-pressable",
                    "rounded-3xl bg-white/60 border border-white/70 p-4"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge
                      config={kid.avatar_config}
                      size={52}
                      className="shrink-0 group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">
                        {kid.display_name || "Kiddo"}
                      </div>
                      <div className="text-sm text-slate-600">
                        Year {kid.year_level ?? "—"} • Tap to continue
                      </div>
                    </div>
                    <div className="ml-auto text-xl">🚀</div>
                  </div>
                </button>
              ))}

              {(kids || []).length === 0 && (
                <div className="rounded-3xl bg-white/60 border border-white/70 p-5">
                  <div className="font-black text-slate-900">No child profiles yet</div>
                  <div className="text-slate-700 mt-1">Create a profile to start learning.</div>
                  <div className="mt-4">
                    <Button onClick={() => router.push("/app/children")}>Create a profile</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </BentoCard>

        <BentoCard className="col-span-12 lg:col-span-4">
          <div className="text-xl font-black text-slate-900">Weekly Highlights</div>
          <div className="text-slate-700 mt-1">A calm snapshot of learning momentum.</div>
          <Divider />
          <ParentInsightCard />
        </BentoCard>

        <BentoCard className="col-span-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl font-black text-slate-900">Insights</div>
              <div className="text-slate-700 mt-1">Progress trends, effort signals, and next-step ideas.</div>
            </div>
            <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to top
            </Button>
          </div>
          <Divider />
          <ParentInsightsDashboard />
        </BentoCard>
      </BentoGrid>
    </PageScaffold>
  );
}
