"use client";

import { getGradeLabel, getGeoConfig } from "@/lib/marketing/geoConfig";

function blankChild() {
  return { display_name: "", year_level: 1 };
}

export default function ChildrenRepeater({ value, onChange, country = "AU" }) {
  const kids = value?.length ? value : [blankChild()];
  const geo = getGeoConfig(country);

  // Generate localized options for this country
  const options = [0, 1, 2, 3, 4, 5, 6].map(y => ({
    value: y,
    label: getGradeLabel(y, country)
  }));

  function updateKid(index, patch) {
    const next = kids.map((k, i) => (i === index ? { ...k, ...patch } : k));
    onChange(next);
  }

  function addKid() {
    onChange([...kids, blankChild()]);
  }

  function removeKid(index) {
    const next = kids.filter((_, i) => i !== index);
    onChange(next.length ? next : [blankChild()]);
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-extrabold">Children</div>
      <p className="text-slate-700 text-sm">
        Add one or more children. You can change this later in Settings.
      </p>

      <div className="space-y-3">
        {kids.map((kid, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="font-bold text-slate-900">Child {i + 1}</div>
              <button
                type="button"
                onClick={() => removeKid(i)}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                aria-label={`Remove child ${i + 1}`}
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                  value={kid.display_name}
                  onChange={(e) => updateKid(i, { display_name: e.target.value })}
                  placeholder="e.g. Olivia"
                  required
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-semibold text-slate-700">{geo.gradeTerm} Level</span>
                <select
                  className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                  value={kid.year_level}
                  onChange={(e) => updateKid(i, { year_level: Number(e.target.value) })}
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addKid}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
      >
        + Add another child
      </button>
    </div>
  );
}