import type { Metadata } from "next";
import { Suspense } from "react";
import { CollegeResults } from "@/components/colleges/CollegeResults";

export const metadata: Metadata = {
  title: "College results",
  description:
    "College results for the states and name you searched. Tuition, selectivity, and enrollment on this page are samples.",
};

export default function CollegeResultsPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-40 max-w-6xl animate-pulse rounded-2xl bg-panel" />}>
      <CollegeResults />
    </Suspense>
  );
}
