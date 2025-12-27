export const metadata = {
  title: "SmartKidz — Coming Soon",
  description:
    "A calm, structured learning world for kids and parents. Launching soon — join the waitlist for early access.",
  robots: {
    index: false,
    follow: false
  }
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <header className="flex flex-col gap-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white grid place-items-center font-black">
                SK
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-slate-700">
                  SmartKidz
                </div>
                <div className="text-xs text-slate-500">
                  Years 1–6 • Australia-aligned
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <a
                href="/marketing/features"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                See features
              </a>
              <a
                href="/marketing/pricing"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Coming soon — signups are temporarily closed
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                Calm learning, built for real families.
              </h1>

              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                SmartKidz brings curriculum-aligned lessons into a simple, guided
                experience: subject tiles → lesson tiles → learning content — plus
                tools that keep kids engaged and help parents stay informed.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/marketing/features"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Explore what’s included
                </a>
                <a
                  href="#waitlist"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Join the waitlist
                </a>
                <span className="text-xs text-slate-500">
                  Launching soon. Early access invites first.
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">
                  What you’ll get at launch
                </div>

                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    Subjects & lessons pulled from Supabase, displayed as clean tiles.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    Homework generator: 20–40 fresh questions based on completed lessons.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    World Explorer: interactive 3D globe with culture, food, landmarks, and facts.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                    “Riley” robot helper that steps in after repeated misses with tips.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                    Parent dashboard: progress, insights, and gentle guardrails.
                  </li>
                </ul>

                <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white">
                  <div className="text-xs font-semibold text-white/80">
                    Status
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Private build in progress • Public signups disabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Subjects & lessons",
              body: "Browse subjects as tiles, then pick a lesson — simple, fast, and consistent.",
              tag: "Curriculum"
            },
            {
              title: "Homework tool",
              body: "Generate a fresh worksheet from mastered content so kids practice skills, not memorization.",
              tag: "Practice"
            },
            {
              title: "World Explorer",
              body: "Tap a country to learn about culture, food, landmarks, and interesting facts.",
              tag: "Geography"
            },
            {
              title: "Riley the robot",
              body: "Helpful prompts after 3 misses: hints, worked examples, and confidence boosts.",
              tag: "Support"
            },
            {
              title: "For parents",
              body: "Visibility and control without being overbearing — insights that make sense.",
              tag: "Dashboard"
            },
            {
              title: "Built to iterate",
              body: "We’re integrating Builder.io so marketing pages and content can evolve quickly.",
              tag: "Builder.io"
            }
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {c.tag}
              </div>
              <div className="mt-3 text-lg font-black">{c.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {c.body}
              </p>
            </div>
          ))}
        </section>

        <section
          id="waitlist"
          className="mt-14 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-2xl font-black">Get notified when we launch</div>
              <p className="mt-2 text-sm text-slate-700">
                Add your email to the waitlist. We’ll announce early access and launch updates.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Note: signups inside the app are disabled until launch.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form
                className="flex flex-col gap-3 sm:flex-row"
                action="https://formsubmit.co/"
                method="post"
                onSubmit={(e) => {
                  // If you haven't configured a waitlist endpoint, prevent submission
                  // and instead open an email draft. Replace with your preferred service later.
                  e.preventDefault();
                  const email = (e.currentTarget.elements.namedItem("email")?.value || "").toString();
                  const subject = encodeURIComponent("SmartKidz waitlist");
                  const body = encodeURIComponent(
                    `Please add me to the SmartKidz waitlist.\n\nEmail: ${email}\n`
                  );
                  window.location.href = `mailto:smartkidzapp1@gmail.com?subject=${subject}&body=${body}`;
                }}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Join waitlist
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-200 pt-8 text-xs text-slate-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} SmartKidz</div>
            <div className="flex gap-4">
              <a className="hover:text-slate-700" href="/marketing/privacy">
                Privacy
              </a>
              <a className="hover:text-slate-700" href="/marketing/terms">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
