import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

export const dynamic = "force-dynamic";

export default async function SubjectWorldPage({ params }) {
  const { subjectId: rawId } = await params;
  const subjectId = decodeURIComponent(rawId);
  const supabase = await createClient();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("edition_id,title,country_code,lesson_templates!inner(subject_id,year_level,topic)")
    .eq("id", subjectId)
    .maybeSingle();

  if (subjectError) {
    return (
      <PageScaffold title="World">
        <main className="p-6">
          <div className="rounded-xl border bg-white p-4 text-sm">
            Failed to load subject: {subjectError.message}
          </div>
        </main>
      </PageScaffold>
    );
  }

  if (!subject || subject.status !== "active") return notFound();

  const { data: lessons, error: lessonsError } = await supabase
    .from("lesson_editions")
    .select("id,title,topic,subject_id")
    .eq("lesson_templates.subject_id", subjectId)
    .order("edition_id", { ascending: true }); // CHANGED: Order by ID to respect sequence

  if (lessonsError) {
    return (
      <PageScaffold title={subject.name}>
        <main className="p-6">
          <div className="rounded-xl border bg-white p-4 text-sm">
            Failed to load lessons: {lessonsError.message}
          </div>
        </main>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold title={subject.name} subtitle="Choose a lesson.">
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/app/worlds" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to subjects
          </Link>
        </div>

        <BentoGrid>
          {(lessons ?? []).map((l) => (
            <BentoCard key={l.id} className="p-5">
              <Link href={`/app/lesson/${encodeURIComponent(l.id)}`} className="block">
                <div className="text-base font-semibold text-slate-900">{l.title}</div>
                {l.topic ? <div className="text-sm text-slate-600 mt-1">{l.topic}</div> : null}
                <div className="text-sm text-slate-600 mt-2">Open lesson</div>
              </Link>
            </BentoCard>
          ))}
        </BentoGrid>
      </main>
    </PageScaffold>
  );
}