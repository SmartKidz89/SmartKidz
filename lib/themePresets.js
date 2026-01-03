export const THEME_PRESETS = [
  // --- Seasonal & Events ---
  {
    id: "halloween",
    name: "Spooky",
    emoji: "🎃",
    heroGradient: "from-orange-500 via-purple-600 to-slate-900",
    bgGradient: "radial-gradient(at 0% 0%, #fb923c 0px, transparent 50%), radial-gradient(at 100% 0%, #9333ea 0px, transparent 50%), radial-gradient(at 100% 100%, #1e293b 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-orange-600",
    colors: { a: [249, 115, 22], b: [147, 51, 234] } // Orange / Purple
  },
  {
    id: "christmas",
    name: "Festive",
    emoji: "🎄",
    heroGradient: "from-red-600 via-green-600 to-emerald-800",
    bgGradient: "radial-gradient(at 0% 0%, #ef4444 0px, transparent 50%), radial-gradient(at 50% 50%, #ffffff 0px, transparent 50%), radial-gradient(at 100% 100%, #15803d 0px, transparent 50%)",
    surface: "bg-white/95",
    sparkle: "text-red-600",
    colors: { a: [220, 38, 38], b: [22, 163, 74] } // Red / Green
  },
  {
    id: "easter",
    name: "Hoppy",
    emoji: "🐰",
    heroGradient: "from-pink-200 via-yellow-200 to-sky-200",
    bgGradient: "radial-gradient(at 0% 0%, #fbcfe8 0px, transparent 50%), radial-gradient(at 100% 0%, #fef08a 0px, transparent 50%), radial-gradient(at 100% 100%, #bae6fd 0px, transparent 50%)",
    surface: "bg-white/80",
    sparkle: "text-pink-500",
    colors: { a: [244, 114, 182], b: [14, 165, 233] } // Pastel Pink / Blue
  },
  {
    id: "valentine",
    name: "Lovely",
    emoji: "💖",
    heroGradient: "from-rose-400 via-pink-400 to-red-400",
    bgGradient: "radial-gradient(at 0% 0%, #fda4af 0px, transparent 50%), radial-gradient(at 100% 0%, #f43f5e 0px, transparent 50%), radial-gradient(at 100% 100%, #fb7185 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-rose-600",
    colors: { a: [225, 29, 72], b: [244, 114, 182] } // Rose / Pink
  },
  {
    id: "eid",
    name: "Crescent",
    emoji: "🌙",
    heroGradient: "from-emerald-600 via-teal-500 to-amber-400",
    bgGradient: "radial-gradient(at 0% 0%, #059669 0px, transparent 50%), radial-gradient(at 100% 0%, #fbbf24 0px, transparent 50%), radial-gradient(at 100% 100%, #0d9488 0px, transparent 50%)",
    surface: "bg-white/95",
    sparkle: "text-emerald-700",
    colors: { a: [5, 150, 105], b: [251, 191, 36] } // Emerald / Gold
  },
  {
    id: "diwali",
    name: "Festival",
    emoji: "🪔",
    heroGradient: "from-orange-500 via-pink-500 to-yellow-500",
    bgGradient: "radial-gradient(at 0% 0%, #f97316 0px, transparent 50%), radial-gradient(at 100% 0%, #ec4899 0px, transparent 50%), radial-gradient(at 100% 100%, #eab308 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-orange-600",
    colors: { a: [249, 115, 22], b: [236, 72, 153] } // Orange / Pink
  },
  
  // --- Classics ---
  {
    id: "rainbow",
    name: "Rainbow",
    emoji: "🌈",
    heroGradient: "from-pink-300 via-amber-200 to-sky-300",
    bgGradient: "radial-gradient(at 0% 0%, #f9a8d4 0px, transparent 50%), radial-gradient(at 100% 0%, #fcd34d 0px, transparent 50%), radial-gradient(at 100% 100%, #7dd3fc 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-amber-600",
    colors: { a: [249, 168, 212], b: [125, 211, 252] } // Pink to Sky
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    heroGradient: "from-sky-300 via-teal-200 to-indigo-300",
    bgGradient: "radial-gradient(at 0% 0%, #7dd3fc 0px, transparent 50%), radial-gradient(at 100% 0%, #99f6e4 0px, transparent 50%), radial-gradient(at 100% 100%, #818cf8 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-sky-700",
    colors: { a: [56, 189, 248], b: [20, 184, 166] }
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    heroGradient: "from-emerald-300 via-lime-200 to-teal-200",
    bgGradient: "radial-gradient(at 0% 0%, #6ee7b7 0px, transparent 50%), radial-gradient(at 100% 0%, #bef264 0px, transparent 50%), radial-gradient(at 100% 100%, #5eead4 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-emerald-700",
    colors: { a: [16, 185, 129], b: [132, 204, 22] }
  },
  {
    id: "space",
    name: "Space",
    emoji: "🚀",
    heroGradient: "from-indigo-400 via-fuchsia-300 to-sky-300",
    bgGradient: "radial-gradient(at 0% 0%, #818cf8 0px, transparent 50%), radial-gradient(at 100% 0%, #e879f9 0px, transparent 50%), radial-gradient(at 100% 100%, #38bdf8 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-fuchsia-700",
    colors: { a: [99, 102, 241], b: [232, 121, 249] }
  },
  {
    id: "candy",
    name: "Candy",
    emoji: "🍬",
    heroGradient: "from-rose-300 via-fuchsia-200 to-violet-300",
    bgGradient: "radial-gradient(at 0% 0%, #fda4af 0px, transparent 50%), radial-gradient(at 100% 0%, #f0abfc 0px, transparent 50%), radial-gradient(at 100% 100%, #c4b5fd 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-rose-700",
    colors: { a: [251, 113, 133], b: [216, 180, 254] }
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    heroGradient: "from-orange-300 via-rose-300 to-purple-300",
    bgGradient: "radial-gradient(at 0% 0%, #fdba74 0px, transparent 50%), radial-gradient(at 100% 0%, #fda4af 0px, transparent 50%), radial-gradient(at 100% 100%, #d8b4fe 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-orange-700",
    colors: { a: [251, 146, 60], b: [168, 85, 247] }
  },
  {
    id: "dino",
    name: "Dino",
    emoji: "🦖",
    heroGradient: "from-green-300 via-amber-200 to-stone-300",
    bgGradient: "radial-gradient(at 0% 0%, #86efac 0px, transparent 50%), radial-gradient(at 100% 0%, #fde68a 0px, transparent 50%), radial-gradient(at 100% 100%, #d6d3d1 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-green-800",
    colors: { a: [74, 222, 128], b: [214, 211, 209] }
  },
  {
    id: "volcano",
    name: "Lava",
    emoji: "🌋",
    heroGradient: "from-red-400 via-orange-300 to-yellow-300",
    bgGradient: "radial-gradient(at 0% 0%, #f87171 0px, transparent 50%), radial-gradient(at 100% 0%, #fdba74 0px, transparent 50%), radial-gradient(at 100% 100%, #fde047 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-red-700",
    colors: { a: [248, 113, 113], b: [253, 224, 71] }
  },
  {
    id: "arctic",
    name: "Ice",
    emoji: "❄️",
    heroGradient: "from-cyan-200 via-white to-blue-200",
    bgGradient: "radial-gradient(at 0% 0%, #a5f3fc 0px, transparent 50%), radial-gradient(at 50% 50%, #ffffff 0px, transparent 50%), radial-gradient(at 100% 100%, #bfdbfe 0px, transparent 50%)",
    surface: "bg-white/80",
    sparkle: "text-cyan-700",
    colors: { a: [34, 211, 238], b: [147, 197, 253] }
  },
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    heroGradient: "from-slate-400 via-indigo-300 to-violet-400",
    bgGradient: "radial-gradient(at 0% 0%, #94a3b8 0px, transparent 50%), radial-gradient(at 100% 0%, #a5b4fc 0px, transparent 50%), radial-gradient(at 100% 100%, #a78bfa 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-indigo-800",
    colors: { a: [71, 85, 105], b: [99, 102, 241] }
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    heroGradient: "from-lime-400 via-yellow-300 to-cyan-400",
    bgGradient: "radial-gradient(at 0% 0%, #a3e635 0px, transparent 50%), radial-gradient(at 100% 0%, #fde047 0px, transparent 50%), radial-gradient(at 100% 100%, #22d3ee 0px, transparent 50%)",
    surface: "bg-white/95",
    sparkle: "text-lime-700",
    colors: { a: [163, 230, 53], b: [34, 211, 238] }
  },
  {
    id: "gold",
    name: "Gold",
    emoji: "🏆",
    heroGradient: "from-yellow-200 via-amber-200 to-orange-200",
    bgGradient: "radial-gradient(at 0% 0%, #fef08a 0px, transparent 50%), radial-gradient(at 100% 0%, #fde68a 0px, transparent 50%), radial-gradient(at 100% 100%, #fed7aa 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-amber-700",
    colors: { a: [250, 204, 21], b: [251, 146, 60] }
  },
  {
    id: "robot",
    name: "Robot",
    emoji: "🤖",
    heroGradient: "from-gray-300 via-slate-200 to-zinc-300",
    bgGradient: "radial-gradient(at 0% 0%, #d1d5db 0px, transparent 50%), radial-gradient(at 100% 0%, #e2e8f0 0px, transparent 50%), radial-gradient(at 100% 100%, #d4d4d8 0px, transparent 50%)",
    surface: "bg-white/95",
    sparkle: "text-slate-700",
    colors: { a: [156, 163, 175], b: [113, 113, 122] }
  },
  {
    id: "fairy",
    name: "Fairy",
    emoji: "🧚",
    heroGradient: "from-teal-200 via-pink-200 to-purple-200",
    bgGradient: "radial-gradient(at 0% 0%, #99f6e4 0px, transparent 50%), radial-gradient(at 100% 0%, #fbcfe8 0px, transparent 50%), radial-gradient(at 100% 100%, #e9d5ff 0px, transparent 50%)",
    surface: "bg-white/85",
    sparkle: "text-teal-600",
    colors: { a: [45, 212, 191], b: [244, 114, 182] }
  },
  {
    id: "classic",
    name: "Classic",
    emoji: "📘",
    heroGradient: "from-indigo-200 via-sky-200 to-teal-200",
    bgGradient: "radial-gradient(at 0% 0%, #c7d2fe 0px, transparent 50%), radial-gradient(at 100% 0%, #bae6fd 0px, transparent 50%), radial-gradient(at 100% 100%, #99f6e4 0px, transparent 50%)",
    surface: "bg-white/90",
    sparkle: "text-indigo-700",
    colors: { a: [99, 102, 241], b: [14, 165, 233] }
  }
];

export function getThemePreset(themeId) {
  return THEME_PRESETS.find(t => t.id === themeId) ?? THEME_PRESETS[0];
}