import type { Metadata } from "next";
import { AcademyView } from "@/components/academy/AcademyView";

export const metadata: Metadata = {
  title: "NXTUP Academy",
  description: "Public videos and short notes on recruiting steps you do yourself.",
};

export default function AcademyPage() {
  return <AcademyView />;
}
