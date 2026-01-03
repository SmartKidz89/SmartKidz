import SmoothScroll from "@/components/marketing/SmoothScroll";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuroraBackdrop from "@/components/ui/AuroraBackdrop";
import { MarketingGeoProvider } from "@/components/marketing/MarketingGeoProvider";

export default function MarketingLayout({ children }) {
  return (
    <MarketingGeoProvider>
      <SmoothScroll>
        <CinematicScroll>
          <div data-theme="parent" className="marketing-ui min-h-screen">
            <AuroraBackdrop variant="parent" />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-extrabold focus:text-slate-900 focus:shadow-lg"
            >
              Skip to content
            </a>
            <NavBar />
            <main id="main" className="outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </CinematicScroll>
      </SmoothScroll>
    </MarketingGeoProvider>
  );
}