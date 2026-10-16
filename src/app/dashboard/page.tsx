import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Edit your NEXTUP profile, checklist, film links, and recruiting progress. Demo data stays on this device.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
