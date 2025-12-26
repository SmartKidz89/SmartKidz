"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as topojson from "topojson-client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function WorldExplorerPage() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const res = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json");
        const world = await res.json();
        const features = topojson.feature(world, world.objects.countries).features;
        if (!cancelled) setCountries(features);
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const globeConfig = useMemo(() => ({
    width: 900,
    height: 520,
  }), []);

  const onSelect = async (f) => {
    setSelected(f);
    setInfo(null);
    setError("");
    // The 110m dataset does not contain ISO codes. We map via a secondary lookup on name with restcountries.
    const guessName = f?.properties?.name;
    if (!guessName) return;
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(guessName)}?fullText=false`);
      const data = await res.json();
      setInfo(Array.isArray(data) ? data[0] : null);
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  return (
    <PageScaffold title="World explorer" subtitle="Hover or tap a country to explore its culture and facts.">
      <main className="p-6 space-y-6">
        <Link href="/app/tools" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to tools
        </Link>

        {error ? <div className="rounded-xl border bg-white p-4 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border bg-white p-3 overflow-hidden">
            <div className="text-xs text-slate-500 px-2 pt-2">
              Tip: drag to rotate, scroll to zoom.
            </div>

            <div className="h-[520px]">
              <Globe
                {...globeConfig}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                polygonsData={countries}
                polygonAltitude={(d) => (d === selected ? 0.08 : 0.01)}
                polygonCapColor={(d) => (d === selected ? "rgba(30, 41, 59, 0.95)" : "rgba(148, 163, 184, 0.6)")}
                polygonSideColor={() => "rgba(148, 163, 184, 0.2)"}
                polygonStrokeColor={() => "rgba(15, 23, 42, 0.3)"}
                onPolygonHover={(d) => setSelected(d || null)}
                onPolygonClick={onSelect}
                polygonsTransitionDuration={150}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-4">
            <div className="text-lg font-semibold">Country</div>
            {!info ? (
              <div className="text-sm text-slate-600">
                Click a country on the globe to load details.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  {info.flags?.png ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={info.flags.png} alt="" className="h-8 w-12 rounded object-cover ring-1 ring-slate-200" />
                  ) : null}
                  <div>
                    <div className="font-semibold text-slate-900">{info.name?.common}</div>
                    <div className="text-slate-600">{info.region}{info.subregion ? ` • ${info.subregion}` : ""}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-slate-500">Capital</div>
                    <div className="font-medium">{info.capital?.[0] ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-slate-500">Population</div>
                    <div className="font-medium">{typeof info.population === "number" ? info.population.toLocaleString() : "—"}</div>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="text-xs text-slate-500">Languages</div>
                  <div className="font-medium">
                    {info.languages ? Object.values(info.languages).join(", ") : "—"}
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="text-xs text-slate-500">Culture ideas</div>
                  <div className="text-slate-700">
                    Explore food, music, clothing, landmarks, and a fun fact. (You can extend this panel with your own curated content per country.)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageScaffold>
  );
}
