import type { Metadata } from "next";
import { DevelopmentView } from "@/components/development/DevelopmentView";

export const metadata: Metadata = {
  title: "Player Development",
  description: "Sample practice checks you can mark on this device. Not filmed sessions or measured test results.",
};

export default function DevelopmentPage() {
  return <DevelopmentView />;
}
