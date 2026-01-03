"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Surface to console for local dev debugging; Sentry (if enabled) will capture separately.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] px-6 pt-24 pb-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-8 shadow-sm">
          <div className="text-sm font-extrabold text-slate-500">Something went wrong</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">We hit an unexpected error.</h1>
          <p className="mt-3 text-slate-600">
            Try reloading this view. If the issue persists, return to the homepage.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset?.()}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800"
            >
              Retry
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-50"
            >
              Go to home
            </Link>
          </div>

          {process.env.NODE_ENV !== "production" && error?.message ? (
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {String(error.message)}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
