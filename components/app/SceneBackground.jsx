"use client";

const VARIANT_BG = {
  maths: "/illustrations/subjects/world-maths.webp",
  math: "/illustrations/subjects/world-maths.webp",
  reading: "/illustrations/subjects/world-reading.webp",
  english: "/illustrations/subjects/world-english.webp",
  science: "/illustrations/subjects/world-science.webp",
  hass: "/illustrations/subjects/world-energy.webp", // placeholder until hass art is added
  hpe: "/illustrations/subjects/world-health.webp",
  health: "/illustrations/subjects/world-health.webp",
  arts: "/illustrations/subjects/world-arts.webp",
  tech: "/illustrations/subjects/world-energy.webp", // placeholder until tech art is added
  technologies: "/illustrations/subjects/world-energy.webp",
  languages: "/illustrations/subjects/world-languages.webp",
  lang: "/illustrations/subjects/world-languages.webp",
  energy: "/illustrations/subjects/world-energy.webp",
  rewards: "/illustrations/app/rewards-header.webp",
};

export default function SceneBackground({ variant = "maths", height = 260 }) {
  const src = VARIANT_BG[variant] || "/illustrations/app/kids-dashboard-header.webp";

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden" style={{ height }}>
      <img src={src} className="absolute inset-0 h-full w-full object-cover opacity-95" alt="" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--bg))]" />
    </div>
  );
}
