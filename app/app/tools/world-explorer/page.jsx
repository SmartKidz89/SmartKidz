"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";

const WorldGlobeClient = dynamic(() => import("./WorldGlobeClient"), { ssr: false });

export default function WorldExplorerPage() {
  const [selected, setSelected] = useState(null);

  const actions = useMemo(() => {
    if (!selected) return null;
    const code = selected.cca2 || selected.cca3 || "";
    const name = selected.name?.common || "Country";
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm opacity-80">Selected:</div>
        <div className="font-semibold">{name}</div>
        {code ? (
          <Link
            className="ml-auto inline-flex items-center justify-center rounded-xl bg-black/90 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
            href={`/app/tools/world-explorer/${code.toUpperCase()}`}
          >
            Enter
          </Link>
        ) : null}
      </div>
    );
  }, [selected]);

  return (
    <PageScaffold
      title="World Explorer"
      subtitle="Hover or tap a country to learn about culture, food, landmarks, and fun facts."
      actions={actions}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-b from-white to-black/[0.02] shadow-sm">
          <div className="absolute inset-0">
            <WorldGlobeClient onSelect={setSelected} />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-2xl bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur">
            Tip: drag to rotate • scroll/pinch to zoom • tap a marker to select
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          {!selected ? (
            <div className="space-y-2">
              <div className="text-lg font-semibold">Pick a country</div>
              <p className="text-sm opacity-80">
                Rotate the globe and hover/tap a marker. Then press Enter to open a country profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-lg font-semibold">{selected.name?.common}</div>
              <div className="text-sm opacity-80">
                Region: {selected.region || "—"}{selected.subregion ? ` • ${selected.subregion}` : ""}
              </div>
              {Array.isArray(selected.capital) && selected.capital.length ? (
                <div className="text-sm opacity-80">Capital: {selected.capital.join(", ")}</div>
              ) : null}
              {selected.flag ? <div className="text-5xl leading-none">{selected.flag}</div> : null}
              <div className="pt-2">
                <Link
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-black/90 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black"
                  href={`/app/tools/world-explorer/${(selected.cca2 || selected.cca3 || "").toUpperCase()}`}
                >
                  Enter country
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageScaffold>
  );
}
