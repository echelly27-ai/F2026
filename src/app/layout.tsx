import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-nextup-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nextup-body",
});

export const metadata: Metadata = {
  title: {
    default: "NEXTUP",
    template: "%s · NEXTUP",
  },
  description:
    "NEXTUP is a basketball recruiting workspace. The public directory lists the ESPN 2027 SC Next 100. Your dashboard and school tracker stay yours.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink font-sans text-paper">
        <AppProviders>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <Suspense fallback={<div className="h-[68px] border-b border-line bg-ink" />}>
            <SiteHeader />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
