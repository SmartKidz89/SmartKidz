"use client";

export default function TrustBar({ compact = false, className = "" }) {
  const items = [
    { icon: "✅", title: "Australian Curriculum aligned", desc: "Mapped by year level and subject." },
    { icon: "🧠", title: "Mastery-based learning", desc: "Builds confidence through practice + review." },
    { icon: "🛡️", title: "Parent-safe experience", desc: "Clear progress, calm design, kid-first UX." },
  ];

  return (
    <div className={`skz-glass skz-shine ${compact ? "p-3" : "p-4"} ${className}`}>
      <div className={`grid ${compact ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-3"} gap-3`}>
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <div className="skz-chip w-10 h-10 flex items-center justify-center shadow-sm">
              <span className="text-lg">{it.icon}</span>
            </div>
            <div>
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-xs text-slate-600">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
