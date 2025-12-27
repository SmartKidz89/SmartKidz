export default function Mascot({ mood = "happy", message }) {
  const faces = {
    happy: "😊",
    sad: "😕",
    excited: "🤩",
    proud: "😎",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="text-5xl">{faces[mood] ?? "😊"}</div>
      {message ? (
        <div className="rounded-2xl bg-white/85 border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
