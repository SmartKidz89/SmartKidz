"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BrandMark from "./BrandMark";
import clsx from "clsx";
import { useSession } from "./auth/useSession";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { session, loading } = useSession();

  // Keep the marketing site and the in-app product on separate origins.
  // In production, set NEXT_PUBLIC_APP_ORIGIN=https://app.smartkidz.app
  const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://app.smartkidz.app";

  const items = useMemo(() => ([
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/curriculum", label: "Curriculum" },
    { href: "/pricing", label: "Pricing" }
  ]), []);

  const isActive = (href) => pathname === href;

  return (
    <header className={clsx("sticky top-0 z-50", scrolled ? "shadow-sm" : "", "skz-glassbar")}>
      <div className="container-pad h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "px-4 py-2 rounded-2xl text-sm font-semibold transition",
                isActive(it.href) ? "bg-brand-primary text-white" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {!loading && session ? (
            <Link
              href={appOrigin}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary text-white px-4 py-2 text-sm font-semibold shadow-soft hover:opacity-95 transition"
            >
              Open App <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href={`${appOrigin}/login`} className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Log in
              </Link>
              <Link
                href={`${appOrigin}/signup`}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary text-white px-4 py-2 text-sm font-semibold shadow-soft hover:opacity-95 transition"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden h-10 w-10 grid place-items-center rounded-2xl hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-pad py-3 space-y-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block px-4 py-3 rounded-2xl font-semibold",
                  isActive(it.href) ? "bg-brand-primary text-white" : "text-slate-800 hover:bg-slate-100"
                )}
              >
                {it.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              {!loading && session ? (
                <Link href={appOrigin} onClick={() => setOpen(false)} className="flex-1 text-center rounded-2xl bg-brand-primary text-white px-4 py-3 font-semibold">
                  Open App
                </Link>
              ) : (
                <>
                  <Link href={`${appOrigin}/login`} onClick={() => setOpen(false)} className="flex-1 text-center rounded-2xl bg-slate-100 px-4 py-3 font-semibold">
                    Log in
                  </Link>
                  <Link href={`${appOrigin}/signup`} onClick={() => setOpen(false)} className="flex-1 text-center rounded-2xl bg-brand-primary text-white px-4 py-3 font-semibold">
                    Start Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
