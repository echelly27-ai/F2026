import type { Metadata } from "next";
import { Suspense } from "react";
import { FindColleges } from "@/components/colleges/FindColleges";

export const metadata: Metadata = {
  title: "Find Colleges",
  description: "Search a public directory of U.S. colleges by name and state. Not a ranking and not a list of coach contacts.",
};

export default function FindCollegesPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-40 max-w-6xl animate-pulse rounded-2xl bg-panel" />}>
      <FindColleges />
    </Suspense>
  );
}
