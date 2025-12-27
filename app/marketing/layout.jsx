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
            <NavBar />
            {children}
            <Footer />
          </div>
        </CinematicScroll>
      </SmoothScroll>
    </MarketingGeoProvider>
  );
}