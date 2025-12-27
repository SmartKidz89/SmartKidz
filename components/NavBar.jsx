"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import BrandMark from "./BrandMark";
import { cn } from "@/lib/utils";
import { useSession } from "./auth/useSession";

export default function NavBar() {
  const { scrollY } = useScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { session, loading } = useSession();

  // Dynamic header styles based on scroll position
  const headerHeight = useTransform(scrollY, [0, 60], ["5.5rem", "4.25rem"]);
  const headerBg = useTransform(scrollY, [0, 60], ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"]);
  const headerBackdrop = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(16px)"]);
  const headerBorder = useTransform(scrollY, [0, 60], ["rgba(0,0,0,0)", "rgba(0,0,0,0.06)"]);
  const headerShadow = useTransform(scrollY, [0, 60], ["none", "0 4px 30px rgba(0,0,0,0.04)"]);

  const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://app.smartkidz.app";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/marketing/features" },
    { name: "Curriculum", href: "/marketing/curriculum" },
    { name: "Pricing", href: "/marketing/pricing" },
  ];

  return (
    <motion.header
      style={{
        height: headerHeight,
        backgroundColor: headerBg,
        backdropFilter: headerBackdrop,
        borderBottomWidth: 1,
        borderBottomColor: headerBorder,
        boxShadow: headerShadow,
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent"
    >
      <div className="container-pad h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group relative z-20">
          <BrandMark />
        </Link>

        {/* Desktop Navigation (Floating Pill) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1.5 rounded-full border border-white/50 shadow-inner backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative",
                  isActive
                    ? "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 relative z-20">
          {!loading && session ? (
            <Link
              href={appOrigin}
              className="group relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href={`${appOrigin}/login`}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href={`${appOrigin}/signup`}
                className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:shadow-brand-primary/40 hover:scale-105 active:scale-95"
              >
                <span>Start Free Trial</span>
                <Sparkles className="w-4 h-4 text-white/90 animate-pulse" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden relative z-20 p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl pt-24 pb-8 px-6 z-10"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "p-4 rounded-2xl text-lg font-bold transition-colors",
                    pathname === link.href ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 my-4" />
              
              {!loading && session ? (
                <Link
                  href={appOrigin}
                  onClick={() => setMobileOpen(false)}
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl text-center font-bold text-lg shadow-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href={`${appOrigin}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="w-full bg-slate-100 text-slate-900 p-4 rounded-2xl text-center font-bold text-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href={`${appOrigin}/signup`}
                    onClick={() => setMobileOpen(false)}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 rounded-2xl text-center font-bold text-lg shadow-lg"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}