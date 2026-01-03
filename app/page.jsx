import MarketingHome from "@/app/marketing/page";
import SmoothScroll from "@/components/marketing/SmoothScroll";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuroraBackdrop from "@/components/ui/AuroraBackdrop";
import { createClient } from "@/lib/supabase/server";
import { RenderBlocks } from "@/components/cms/RenderBlocks";
import { normalizePageContent } from "@/lib/cms/blocks";

export const metadata = {
  title: "SmartKidz — Years 1–6 Learning (AU)",
  description:
    "Maths, English & Science that adapts to your child. Calm, structured, mastery-first learning for Australian families.",
};

export default async function RootPage() {
  const sb = await createClient();
  
  // 1. Check for CMS override for "home"
  const { data: page } = await sb
    .from("cms_pages")
    .select("content_json")
    .eq("scope", "marketing")
    .eq("slug", "home")
    .eq("published", true)
    .maybeSingle();

  if (page) {
    const content = normalizePageContent(page.content_json);
    return (
      <SmoothScroll>
        <CinematicScroll>
          <div data-theme="parent" className="marketing-ui min-h-screen">
            <AuroraBackdrop variant="parent" />
            <NavBar />
            <main id="main">
               <RenderBlocks content={content} />
            </main>
            <Footer />
          </div>
        </CinematicScroll>
      </SmoothScroll>
    );
  }

  // 2. Fallback to Hardcoded Component
  return (
    <SmoothScroll>
      <CinematicScroll>
        <div data-theme="parent" className="marketing-ui min-h-screen">
          <AuroraBackdrop variant="parent" />
          <NavBar />
          <MarketingHome />
          <Footer />
        </div>
      </CinematicScroll>
    </SmoothScroll>
  );
}