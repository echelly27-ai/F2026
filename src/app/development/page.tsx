import type { Metadata } from "next";
import { DevelopmentView } from "@/components/development/DevelopmentView";

export const metadata: Metadata = {
  title: "Player Development",
};

export default function DevelopmentPage() {
  return <DevelopmentView />;
}
