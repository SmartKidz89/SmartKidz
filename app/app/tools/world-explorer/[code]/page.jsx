import { Page as PageScaffold } from "@/components/ui/PageScaffold";

export default async function CountryPage({ params }) {
  const code = (params?.code || "").toUpperCase();
  // This can be upgraded to Supabase-backed content later.
  let country = null;
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    const data = await res.json();
    country = Array.isArray(data) ? data[0] : data;
  } catch {}

  return (
    <PageScaffold title={country?.name?.common || `Country: ${code}`} subtitle="Explore food, culture, landmarks, and fun facts.">
      <div className="mx-auto max-w-3xl space-y-6">
        {!country ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            Could not load country details for {code}.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-6xl leading-none">{country.flag}</div>
                <div>
                  <div className="text-2xl font-bold">{country.name.common}</div>
                  <div className="text-sm opacity-80">
                    {country.region}{country.subregion ? ` • ${country.subregion}` : ""}{country.capital?.length ? ` • Capital: ${country.capital.join(", ")}` : ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Section title="Culture" text="Kid-friendly culture notes will appear here. Next step: store curated content in Supabase per country code." />
              <Section title="Food" text="Popular foods and dishes will appear here." />
              <Section title="Landmarks" text="Famous places to visit will appear here." />
              <Section title="Fun facts" text="Interesting facts will appear here." />
            </div>
          </>
        )}
      </div>
    </PageScaffold>
  );
}

function Section({ title, text }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm opacity-80">{text}</p>
    </div>
  );
}
