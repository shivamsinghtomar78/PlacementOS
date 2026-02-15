import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlacementOS — Your Placement Command Center",
  description:
    "A sophisticated, real-time placement preparation tracker with hierarchical subject management, spaced repetition, analytics, and AI-driven insights.",
  keywords: ["placement", "preparation", "tracker", "DSA", "interview", "coding"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased text-[16px]`}>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
