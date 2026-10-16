import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/players/DiscoverBoard";

export const metadata: Metadata = {
  title: "Discover players",
  description: "Search fictional NEXTUP demonstration profiles by name, position, class, height, and location.",
};

export default function PlayersPage() {
  return <DiscoverBoard />;
}
