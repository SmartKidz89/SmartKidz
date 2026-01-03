import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] px-6 pt-24 pb-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-8 shadow-sm">
          <div className="text-sm font-extrabold text-slate-500">404</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">Page not found</h1>
          <p className="mt-3 text-slate-600">
            The page you’re looking for doesn’t exist, or it may have been moved.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800"
            >
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
