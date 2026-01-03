"use client";

import { AVATARS } from "@/lib/avatars";

export function getAvatarPreset(avatarId) {
  // Graceful fallback if ID doesn't exist or is old format
  return AVATARS.find(a => a.key === avatarId) ?? AVATARS[0];
}

export default function AvatarBadge({ avatarId, config, size = 44, className = "" }) {
  // Support both direct ID or config object passing
  const key = avatarId || config?.avatarId || config?.avatar_key || "robot";
  const a = getAvatarPreset(key);
  
  return (
    <div
      className={`grid place-items-center rounded-2xl shadow-sm ${a.bg || "bg-slate-100"} ${a.ring || ""} ${className}`}
      style={{ width: size, height: size }}
      aria-label={a.name}
      title={a.name}
    >
      <span style={{ fontSize: Math.max(18, Math.floor(size * 0.6)) }}>{a.emoji}</span>
    </div>
  );
}

// Deprecated picker - use the new AvatarPage instead
export function AvatarPicker({ value, onChange }) {
  return null; 
}