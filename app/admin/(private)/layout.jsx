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
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="p-6 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-900/20">
              SK
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight">SmartKidz</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Console</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
           <AdminSidebar role={role} />
        </div>

        <div className="p-4 border-t border-slate-100/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
             <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
               {username[0]}
             </div>
             <div className="min-w-0 flex-1">
               <div className="text-xs font-bold text-slate-900 truncate">{username}</div>
               <div className="text-[10px] font-medium text-slate-500 capitalize">{role}</div>
             </div>
             <form action="/api/admin-auth/logout" method="post">
               <button className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors">
                 Exit
               </button>
             </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
           <div className="font-bold">SmartKidz Admin</div>
           <form action="/api/admin-auth/logout" method="post">
             <button className="text-xs font-bold text-slate-500">Sign Out</button>
           </form>
        </div>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}