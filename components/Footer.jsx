import Link from "next/link";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-pad py-10 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <BrandMark />
          <p className="text-sm text-slate-600">
            Calm, structured learning for Australian families — with adaptive practice, accessibility, and mastery-first progress.
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-bold">Explore</div>
          <div className="grid gap-2 text-sm">
            <Link href="/features" className="text-slate-700 hover:underline">Features</Link>
            <Link href="/curriculum" className="text-slate-700 hover:underline">Curriculum</Link>
            <Link href="/pricing" className="text-slate-700 hover:underline">Pricing</Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-bold">Trust</div>
          <div className="grid gap-2 text-sm text-slate-700">
            <span>Privacy-first · No ads · Child-safe design</span>
            <span className="text-slate-500">© {new Date().getFullYear()} Smart Kidz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
