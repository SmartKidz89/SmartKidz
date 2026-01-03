import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, user: session.user, role: session.role });
}
