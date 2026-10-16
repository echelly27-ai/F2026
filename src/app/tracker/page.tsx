import type { Metadata } from "next";
import { TrackerView } from "@/components/tracker/TrackerView";

export const metadata: Metadata = {
  title: "Recruiting tracker",
  description: "Track schools you are researching and the outreach dates you record yourself.",
};

export default function TrackerPage() {
  return <TrackerView />;
}
