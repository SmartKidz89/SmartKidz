import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function CurriculumPage() {
  return (
    
    <PageScaffold title="Curriculum">
<main className="max-w-5xl mx-auto px-6 py-16">
      <div className="skz-glass skz-border-animate skz-shine p-8">
        <div className="text-sm text-slate-500">Curriculum</div>
        <h1 className="text-4xl font-bold mt-2">Australian Curriculum aligned</h1>
        <p className="text-lg mt-4 text-slate-700">
          SmartKidz is mapped by subject and year level. Lessons are short, focused and designed for real understanding.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skz-card p-5">
            <div className="text-xs text-slate-500">15-minute lessons</div>
            <div className="text-lg font-semibold mt-1">Calm, focused learning</div>
            <p className="text-sm text-slate-600 mt-2">
              Concept → example → practice → mini-quiz → reflection.
            </p>
          </div>
          <div className="skz-card p-5">
            <div className="text-xs text-slate-500">Mastery-based</div>
            <div className="text-lg font-semibold mt-1">Build confidence</div>
            <p className="text-sm text-slate-600 mt-2">
              Kids revisit topics through practice and spaced review so skills stick.
            </p>
          </div>
          <div className="skz-card p-5">
            <div className="text-xs text-slate-500">Parent insights</div>
            <div className="text-lg font-semibold mt-1">See progress clearly</div>
            <p className="text-sm text-slate-600 mt-2">
              Dashboards, streaks and celebrations help you guide learning at home.
            </p>
          </div>
        </div>

        <div className="mt-8 skz-divider" />
        <div className="mt-6">
          <div className="text-sm text-slate-500">Subjects</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-700">
            <div className="skz-chip px-3 py-2">Mathematics</div>
            <div className="skz-chip px-3 py-2">English</div>
            <div className="skz-chip px-3 py-2">Science</div>
            <div className="skz-chip px-3 py-2">HASS</div>
            <div className="skz-chip px-3 py-2">HPE</div>
            <div className="skz-chip px-3 py-2">The Arts</div>
            <div className="skz-chip px-3 py-2">Technologies</div>
            <div className="skz-chip px-3 py-2">Languages</div>
          </div>
        </div>
      </div>
    </main>
  
    </Page>
  );
}