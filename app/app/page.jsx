import DashboardClient from "@/components/app/DashboardClient";
import { createClient } from "@/lib/supabase/server";
import { RenderBlocks } from "@/components/cms/RenderBlocks";
import { normalizePageContent } from "@/lib/cms/blocks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SmartKidz App",
};

export default async function AppHome() {
  const sb = await createClient();
  
  // Check for CMS override: scope='app', slug='home'
  const { data: page } = await sb
    .from("cms_pages")
    .select("content_json")
    .eq("scope", "app")
    .eq("slug", "home")
    .eq("published", true)
    .maybeSingle();

  if (page) {
    const content = normalizePageContent(page.content_json);
    return <RenderBlocks content={content} />;
  }

  // Fallback
  return <DashboardClient />;
}