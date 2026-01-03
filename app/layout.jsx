import { Nunito } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

// 1. Configure the "Nunito" font (Standard in Next.js)
const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"], // Grab the bold weights for headlines
  variable: "--font-nunito",
});

export const metadata = {
  title: "Smart Kidz — Years 1–6 Learning (AU)",
  description:
    "Maths, English & Science that adapts to your child. Calm, structured, mastery-first learning for Australian families.",
  // Default to no-index until explicitly enabled in environment.
  robots:
    (process.env.NEXT_PUBLIC_ROBOTS_INDEX === "1" || process.env.ROBOTS_INDEX === "1")
      ? { index: true, follow: true }
      : { index: false, follow: false },
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  openGraph: {
    title: "Smart Kidz",
    description:
      "Maths, English & Science that adapts to your child. Calm, structured, mastery-first learning for Australian families.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow user zoom for accessibility.
  userScalable: true,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 2. Apply the font class (nunito.className) 
         3. Apply the "app-ui" class to turn on the colors/background 
      */}
      {/* Theme is applied per-route (marketing vs app) via data-theme wrappers */}
      <body className={nunito.className}>
        {/* Analytics is optional; no-ops without env */}
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}