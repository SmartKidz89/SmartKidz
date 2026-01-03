export default function AuroraBackdrop({ variant = "kid" }) {
  const isKid = variant === "kid";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 opacity-90" />
      <div className={
        "absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full blur-3xl " +
        (isKid ? "bg-emerald-400/20" : "bg-sky-400/18")
      } />
      <div className={
        "absolute top-10 -right-28 h-[580px] w-[580px] rounded-full blur-3xl " +
        (isKid ? "bg-indigo-400/16" : "bg-emerald-400/14")
      } />
      <div className={
        "absolute -bottom-32 left-1/3 h-[700px] w-[700px] rounded-full blur-3xl " +
        (isKid ? "bg-amber-300/14" : "bg-amber-300/12")
      } />
    </div>
  );
}
