"use client";

const AVATAR_PRESETS = [
  { id: "lion", label: "Lion", emoji: "🦁" },
  { id: "unicorn", label: "Unicorn", emoji: "🦄" },
  { id: "panda", label: "Panda", emoji: "🐼" },
  { id: "fox", label: "Fox", emoji: "🦊" },
  { id: "dino", label: "Dino", emoji: "🦖" },
  { id: "penguin", label: "Penguin", emoji: "🐧" },
  { id: "cat", label: "Cat", emoji: "🐱" },
  { id: "dog", label: "Dog", emoji: "🐶" },
  { id: "koala", label: "Koala", emoji: "🐨" },
  { id: "robot", label: "Robot", emoji: "🤖" },
  { id: "astronaut", label: "Astronaut", emoji: "🧑‍🚀" },
  { id: "wizard", label: "Wizard", emoji: "🧙" }
];

export function getAvatarPreset(avatarId) {
  return AVATAR_PRESETS.find(a => a.id === avatarId) ?? AVATAR_PRESETS[0];
}

export default function AvatarBadge({ avatarId, size = 44, className = "" }) {
  const a = getAvatarPreset(avatarId);
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-soft ${className}`}
      style={{ width: size, height: size }}
      aria-label={a.label}
      title={a.label}
    >
      <span style={{ fontSize: Math.max(18, Math.floor(size * 0.55)) }}>{a.emoji}</span>
    </div>
  );
}

export function AvatarPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {AVATAR_PRESETS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onChange(a.id)}
          className={`rounded-2xl p-2 ring-1 transition hover:-translate-y-[1px] ${
            value === a.id ? "ring-brand-primary bg-indigo-50" : "ring-slate-200 bg-white"
          }`}
          title={a.label}
        >
          <div className="grid place-items-center text-2xl">{a.emoji}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-700 text-center truncate">{a.label}</div>
        </button>
      ))}
    </div>
  );
}
