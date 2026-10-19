import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/players/DiscoverBoard";

export const metadata: Metadata = {
  title: "Discover players",
  description: "Search the publicly listed ESPN 2027 SC Next 100 by name, position, class, height, location, school, rank, and stars.",
};

export default function PlayersPage() {
  return <DiscoverBoard />;
}
