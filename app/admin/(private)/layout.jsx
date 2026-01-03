import { requireAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
  const auth = await requireAdminSession();
  if (!auth.ok) redirect("/admin/login");

  const session = auth.session;
  const role = session?.role || "admin";
  const username = session?.user?.username || "admin";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold">
              SK
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Admin Console</div>
              <div className="text-xs text-slate-500">Signed in as {username} ({role})</div>
            </div>
          </div>
          <form action="/api/admin-auth/logout" method="post">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <AdminSidebar role={role} />

        <main className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
