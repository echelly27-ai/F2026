import type { Metadata } from "next";
import { RecruitingGuide } from "@/components/home/RecruitingGuide";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How to build one basketball profile, add film, list target schools, and track the outreach you send.",
};

export default function HowItWorksPage() {
  return <RecruitingGuide heading="h1" />;
}
