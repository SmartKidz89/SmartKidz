import { FocusModeProvider } from "@/components/ui/FocusModeProvider";
import { MomentsProvider } from "@/components/ui/MomentsProvider";
import { NavMotionProvider } from "@/components/ui/NavMotionProvider";
import AppShell from "@/components/app/AppShell";
import { ActiveChildProvider } from "@/components/app/ActiveChildProvider";
import { RewardProvider } from "@/components/ui/RewardProvider";
import AuroraBackdrop from "@/components/ui/AuroraBackdrop";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata = {
  title: "SmartKidz App",
};

export default function AppLayout({ children }) {
  return (
    <div data-theme="kid" className="app-ui">
      <ThemeProvider>
        <AuroraBackdrop variant="kid" />
        <NavMotionProvider>
          <FocusModeProvider>
            <MomentsProvider>
              <RewardProvider>
                <ActiveChildProvider>
                  <AppShell>
                    <div className="min-h-screen px-4 pb-24 pt-4">
                      <div className="mx-auto max-w-6xl">{children}</div>
                    </div>
                  </AppShell>
                </ActiveChildProvider>
              </RewardProvider>
            </MomentsProvider>
          </FocusModeProvider>
        </NavMotionProvider>
      </ThemeProvider>
    </div>
  );
}