"use client";

const baseSvgProps = {
  pointerEvents: "none",
  style: { pointerEvents: "none" },
};

export function MathWorldArt({ className = "" }) {
  return (
    <svg
      {...baseSvgProps}
      viewBox="0 0 420 220"
      className={className}
      role="img"
      aria-label="Math world illustration"
    >
      <defs>
        <linearGradient id="mw" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#60A5FA" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#FBBF24" stopOpacity="0.45" />
          <stop offset="1" stopColor="#34D399" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="420" height="220" rx="28" fill="url(#mw)" />
      <circle cx="80" cy="80" r="52" fill="white" fillOpacity="0.55" />
      <circle cx="345" cy="55" r="34" fill="white" fillOpacity="0.35" />
      <g fill="white" fillOpacity="0.65">
        <rect x="70" y="132" width="86" height="18" rx="9" />
        <rect x="70" y="158" width="130" height="18" rx="9" />
        <rect x="270" y="120" width="98" height="18" rx="9" />
        <rect x="270" y="146" width="70" height="18" rx="9" />
      </g>
    </svg>
  );
}

export function EnglishWorldArt({ className = "" }) {
  return (
    <svg
      {...baseSvgProps}
      viewBox="0 0 420 220"
      className={className}
      role="img"
      aria-label="English world illustration"
    >
      <defs>
        <linearGradient id="ew" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#FB7185" stopOpacity="0.35" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="420" height="220" rx="28" fill="url(#ew)" />
      <rect x="58" y="70" width="120" height="120" rx="18" fill="white" fillOpacity="0.45" />
      <rect x="200" y="78" width="160" height="18" rx="9" fill="white" fillOpacity="0.65" />
      <rect x="200" y="108" width="120" height="18" rx="9" fill="white" fillOpacity="0.55" />
      <rect x="200" y="138" width="150" height="18" rx="9" fill="white" fillOpacity="0.50" />
      <rect x="200" y="168" width="90" height="18" rx="9" fill="white" fillOpacity="0.45" />
    </svg>
  );
}

export function ScienceWorldArt({ className = "" }) {
  return (
    <svg
      {...baseSvgProps}
      viewBox="0 0 420 220"
      className={className}
      role="img"
      aria-label="Science world illustration"
    >
      <defs>
        <linearGradient id="sw" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#34D399" stopOpacity="0.45" />
          <stop offset="0.55" stopColor="#60A5FA" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FBBF24" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="420" height="220" rx="28" fill="url(#sw)" />
      <circle cx="105" cy="92" r="52" fill="white" fillOpacity="0.35" />
      <circle cx="300" cy="115" r="64" fill="white" fillOpacity="0.25" />
      <g fill="white" fillOpacity="0.65">
        <rect x="60" y="150" width="150" height="18" rx="9" />
        <rect x="60" y="176" width="110" height="18" rx="9" />
        <rect x="250" y="64" width="110" height="18" rx="9" />
        <rect x="250" y="90" width="80" height="18" rx="9" />
      </g>
    </svg>
  );
}
