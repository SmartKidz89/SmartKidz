import ParentHomeClient from "@/components/app/ParentHomeClient";
import { createClient } from "@/lib/supabase/server";
import { RenderBlocks } from "@/components/cms/RenderBlocks";
import { normalizePageContent } from "@/lib/cms/blocks";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const sb = await createClient();
  
  // Check for CMS override: scope='app', slug='parent'
  const { data: page } = await sb
    .from("cms_pages")
    .select("content_json")
    .eq("scope", "app")
    .eq("slug", "parent")
    .eq("published", true)
    .maybeSingle();

  if (page) {
    const content = normalizePageContent(page.content_json);
    return <RenderBlocks content={content} />;
  }

  // Fallback
  return <ParentHomeClient />;
}