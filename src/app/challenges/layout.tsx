import { Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-challenge-serif",
  display: "swap",
});

export default function ChallengesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={serif.variable} style={{ fontFamily: "var(--font-challenge-serif), Georgia, serif" }}>
      {children}
    </div>
  );
}
