import Image from "next/image";

export default function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <Image
          src="/brand/logo.png"
          alt="SmartKidz"
          fill
          className="object-contain"
          priority
        />
      </div>

      {!compact && (
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight text-slate-900">SmartKidz</div>
          <div className="text-xs text-slate-600">Years 1–6 · Maths · English · Science</div>
        </div>
      )}
    </div>
  );
}
