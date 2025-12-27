import MarketingHome from "@/app/marketing/page";
import SmoothScroll from "@/components/marketing/SmoothScroll";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuroraBackdrop from "@/components/ui/AuroraBackdrop";

export const metadata = {
  title: "SmartKidz — Years 1–6 Learning (AU)",
  description:
    "Maths, English & Science that adapts to your child. Calm, structured, mastery-first learning for Australian families.",
};

export default function RootPage() {
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