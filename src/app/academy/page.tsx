import type { Metadata } from "next";
import { AcademyView } from "@/components/academy/AcademyView";

export const metadata: Metadata = {
  title: "NXTUP Academy",
  description: "Short original notes on recruiting steps you do yourself. NEXTUP does not contact coaches.",
};

export default function AcademyPage() {
  return <AcademyView />;
}
