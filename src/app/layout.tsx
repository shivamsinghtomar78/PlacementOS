import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PlacementOS - Your Placement Command Center",
  description:
    "A fast, focused placement preparation tracker with subject management, revision planning, and analytics.",
  keywords: ["placement", "preparation", "tracker", "DSA", "interview", "coding"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased text-[16px] bg-slate-950 text-slate-100`}>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

