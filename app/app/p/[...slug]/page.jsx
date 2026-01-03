import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RenderBlocks } from "@/components/cms/RenderBlocks";
import { normalizePageContent } from "@/lib/cms/blocks";

export const dynamic = "force-dynamic";

export default async function CmsAppPage({ params }) {
  const { slug: slugArray } = await params;
  const slug = Array.isArray(slugArray) ? slugArray.join("/") : "";
  
  const sb = await createClient();
  const { data, error } = await sb
    .from("cms_pages")
    .select("title, content_json")
    .eq("scope", "app")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    const fromPath = `/app/p/${slug}`;
    const { data: r } = await sb
      .from("cms_redirects")
      .select("to_path, status")
      .eq("from_path", fromPath)
      .eq("is_active", true)
      .maybeSingle();

    if (r?.to_path) {
      redirect(r.to_path);
    }
    notFound();
  }

  const content = normalizePageContent(data.content_json);
  return (
    <RenderBlocks content={content} />
  );
}