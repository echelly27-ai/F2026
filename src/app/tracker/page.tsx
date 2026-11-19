import type { Metadata } from "next";
import { TrackerView } from "@/components/tracker/TrackerView";

export const metadata: Metadata = {
  title: "My Colleges",
  description: "Schools you save from Find Colleges.",
};

export default function TrackerPage() {
  return <TrackerView />;
}
