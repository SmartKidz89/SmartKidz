import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

const SUBJECT_ICON = {
  MAT: "/tiles/math.svg",
  ENG: "/tiles/reading.svg",
  SCI: "/tiles/science.svg",
  HPE: "/tiles/energy.svg",
};

export const dynamic = "force-dynamic";

export default async function WorldsIndexPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id,name,sort_order,status")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <PageScaffold title="Worlds">
        <main className="p-6">
          <div className="rounded-xl border bg-white p-4 text-sm">
            Failed to load subjects: {error.message}
          </div>
        </main>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold title="Worlds" subtitle="Pick a subject to start learning.">
      <main className="p-6">
        <BentoGrid>
          {(subjects ?? []).map((s) => {
            const icon = SUBJECT_ICON[s.id] ?? "/tiles/reading.svg";
            return (
              <BentoCard key={s.id} className="p-5">
                <Link href={`/app/worlds/${encodeURIComponent(s.id)}`} className="block">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <Image src={icon} alt="" fill className="p-2" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-900">{s.name}</div>
                      <div className="text-sm text-slate-600">View lessons</div>
                    </div>
                  </div>
                </Link>
              </BentoCard>
            );
          })}
        </BentoGrid>
      </main>
    </PageScaffold>
  );
}
