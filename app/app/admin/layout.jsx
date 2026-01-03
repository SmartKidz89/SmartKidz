import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function isAdminUser(supabase) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return { ok: false, reason: "not_signed_in" };

  // For setup phase: Allow ALL authenticated users to access admin tools
  // This allows you to run the generator script.
  // TODO: Revert this to strict check later:
  // const role = (data?.role || "parent").toString().toLowerCase();
  // if (role !== "admin") return { ok: false, reason: "not_admin" };

  return { ok: true, user };
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const res = await isAdminUser(supabase);

  if (!res.ok) {
    if (res.reason === "not_signed_in") redirect("/app/login");
    redirect("/app?notice=admin_required");
  }

  return children;
}