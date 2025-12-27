"use client";

import { useMemo, useState } from "react";
import { AVATARS } from "@/lib/avatars";
import { useActiveChild } from "@/hooks/useActiveChild";

export default function AvatarPicker({ size = "md", showName = false }) {
  const { activeChild, updateActiveChild } = useActiveChild();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const sizes = {
    md: "h-10 w-10 text-lg rounded-2xl",
    lg: "h-12 w-12 text-xl rounded-3xl",
    xl: "h-14 w-14 text-2xl rounded-3xl",
  };

  const avatarKey = activeChild?.avatar_key || "robot";
  const avatar = useMemo(() => AVATARS.find((a) => a.key === avatarKey) || AVATARS[0], [avatarKey]);

  async function pick(key) {
    if (!activeChild?.id) return;
    setSaving(true);
    const res = await updateActiveChild({ avatar_key: key });
    setSaving(false);
    if (!res.ok) return;
  }

  return (
    <>
      <button
        type="button"
        className={`relative ${sizes[size] || sizes.md} grid place-items-center bg-white/80 border border-slate-200 shadow-sm`}
        onClick={() => setOpen(true)}
        aria-label="Change avatar"
      >
        <span className="leading-none">{avatar.emoji}</span>
        {saving && <span className="absolute -bottom-2 text-[10px] font-black text-slate-500">…</span>}
      </button>

      {showName && (
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-slate-500">PLAYER</div>
          <div className="text-sm font-extrabold text-slate-900 truncate">
            {activeChild?.display_name || "Player"}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-4xl bg-white shadow-elevated border border-slate-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black text-slate-900">Choose an avatar</div>
                <div className="text-sm font-semibold text-slate-600">Pick one that feels like you.</div>
              </div>
              <button
                className="h-10 px-4 rounded-2xl bg-slate-100 font-extrabold text-slate-700 hover:bg-slate-200"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => pick(a.key)}
                  className={`h-12 w-12 rounded-2xl grid place-items-center border transition
                    ${a.key === avatarKey ? "border-brand-primary bg-brand-primary/10" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
                  aria-label={`Select avatar ${a.name}`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                </button>
              ))}
            </div>

            <button
              className="mt-6 w-full rounded-2xl bg-slate-900 text-white py-3 font-extrabold"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
