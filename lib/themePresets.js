export const THEME_PRESETS = [
  {
    id: "rainbow",
    name: "Rainbow",
    heroGradient: "from-pink-300 via-amber-200 to-sky-300",
    surface: "bg-white/85",
    ring: "ring-white/40",
    sparkle: "text-amber-600"
  },
  {
    id: "ocean",
    name: "Ocean",
    heroGradient: "from-sky-300 via-teal-200 to-indigo-300",
    surface: "bg-white/85",
    ring: "ring-white/40",
    sparkle: "text-sky-700"
  },
  {
    id: "forest",
    name: "Forest",
    heroGradient: "from-emerald-300 via-lime-200 to-teal-200",
    surface: "bg-white/85",
    ring: "ring-white/40",
    sparkle: "text-emerald-700"
  },
  {
    id: "space",
    name: "Space",
    heroGradient: "from-indigo-400 via-fuchsia-300 to-sky-300",
    surface: "bg-white/85",
    ring: "ring-white/40",
    sparkle: "text-fuchsia-700"
  },
  {
    id: "candy",
    name: "Candy",
    heroGradient: "from-rose-300 via-fuchsia-200 to-violet-300",
    surface: "bg-white/85",
    ring: "ring-white/40",
    sparkle: "text-rose-700"
  },
  {
    id: "classic",
    name: "Classic",
    heroGradient: "from-indigo-200 via-sky-200 to-teal-200",
    surface: "bg-white/90",
    ring: "ring-slate-200",
    sparkle: "text-indigo-700"
  }
];

export function getThemePreset(themeId) {
  return THEME_PRESETS.find(t => t.id === themeId) ?? THEME_PRESETS[0];
}

export function toneFromYearLevel(yearLevel) {
  // A/B/C mapping by year level: 1-2 = A, 3-4 = B, 5-6 = C
  if (yearLevel <= 2) return "playful";
  if (yearLevel <= 4) return "balanced";
  return "confident";
}
