import { ThemeProvider } from "@/components/ui/ThemeProvider";
import AuroraBackdrop from "@/components/ui/AuroraBackdrop";

export default function SetupLayout({ children }) {
  return (
    <div data-theme="kid" className="app-ui min-h-screen">
      <ThemeProvider>
        <AuroraBackdrop variant="kid" />
        <div className="container-pad py-10">
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}