"use client";

import { useEffect, useMemo, useState } from "react";

export default function ConfettiBurst({ show }) {
  const pieces = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!show) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), 1200);
    return () => clearTimeout(t);
  }, [show]);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {pieces.map((i) => (
          <span
            key={i}
            className="sk-confetti"
            style={{
              "--dx": `${(Math.random() * 240 - 120).toFixed(0)}px`,
              "--dy": `${(Math.random() * -240 - 120).toFixed(0)}px`,
              "--rz": `${(Math.random() * 720 - 360).toFixed(0)}deg`,
              "--d": `${(Math.random() * 0.25 + 0.65).toFixed(2)}s`,
              "--s": `${(Math.random() * 0.6 + 0.7).toFixed(2)}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
