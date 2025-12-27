import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function isAdminUser(supabase) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return { ok: false, reason: "not_signed_in" };

  // Demo mode: allow admin routes for deterministic UAT without DB setup.
  const demo = (process.env.NEXT_PUBLIC_DEMO_MODE || "").toString().toLowerCase();
  if (demo === "1" || demo === "true") return { ok: true, user };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { ok: false, reason: "profile_error" };
  const role = (data?.role || "parent").toString().toLowerCase();
  if (role !== "admin") return { ok: false, reason: "not_admin" };

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
