"use client";

import dynamic from "next/dynamic";

const Rive = dynamic(() => import("./RiveMascot"), { ssr: false });

/**
 * Mascot renderer.
 * - Uses Rive if NEXT_PUBLIC_RIVE_MASCOT_URL is set.
 * - Falls back to a lightweight static mascot.
 */
export default function Mascot({ className = "" }) {
  const url = process.env.NEXT_PUBLIC_RIVE_MASCOT_URL;
  if (url) return <Rive className={className} url={url} />;
  return (
    <div className={className} aria-hidden="true">
      <div className="w-14 h-14 rounded-3xl bg-white/60 border border-white/60 backdrop-blur shadow-[0_15px_40px_rgba(0,0,0,0.14)] flex items-center justify-center text-3xl">
        🐨
      </div>
    </div>
  );
}
