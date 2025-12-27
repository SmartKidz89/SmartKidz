"use client";
import ChildAvatar from "./ChildAvatar";

const COLORS = ["indigo","sky","emerald","rose","amber"];
const FACES = ["smile","grin","cool","curious","star"];
const HATS = ["none","cap","crown","headphones","bow"];

export default function AvatarPicker({ value, onChange }) {
  const v = value || { color: "indigo", face: "smile", hat: "none" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ChildAvatar config={v} size={72} />
        <div>
          <div className="text-lg font-semibold">Your Avatar</div>
          <div className="text-sm text-slate-600">Pick a face, colour and a fun accessory.</div>
        </div>
      </div>

      <div className="skz-card p-4">
        <div className="text-sm font-semibold mb-3">Face</div>
        <div className="flex flex-wrap gap-2">
          {FACES.map((f) => (
            <button
              key={f}
              className={`skz-chip px-3 py-2 skz-press ${v.face === f ? "ring-2 ring-indigo-400/60" : ""}`}
              onClick={() => onChange({ ...v, face: f })}
            >
              <span className="text-lg">{({smile:"😊",grin:"😁",cool:"😎",curious:"🤓",star:"🤩"})[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="skz-card p-4">
        <div className="text-sm font-semibold mb-3">Colour</div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`skz-chip px-3 py-2 skz-press ${v.color === c ? "ring-2 ring-indigo-400/60" : ""}`}
              onClick={() => onChange({ ...v, color: c })}
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                {indigo:"from-indigo-400 to-indigo-600",sky:"from-sky-400 to-sky-600",emerald:"from-emerald-400 to-emerald-600",rose:"from-rose-400 to-rose-600",amber:"from-amber-400 to-amber-600"}[c]
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className="skz-card p-4">
        <div className="text-sm font-semibold mb-3">Accessory</div>
        <div className="flex flex-wrap gap-2">
          {HATS.map((h) => (
            <button
              key={h}
              className={`skz-chip px-3 py-2 skz-press ${v.hat === h ? "ring-2 ring-indigo-400/60" : ""}`}
              onClick={() => onChange({ ...v, hat: h })}
            >
              <span className="text-lg">
                {({none:"—",cap:"🧢",crown:"👑",headphones:"🎧",bow:"🎀"})[h]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
