import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/players/DiscoverBoard";

export const metadata: Metadata = {
  title: "Discover players",
  description:
    "Browse the public directory by class, position, location, height, and rank. The ESPN 2027 list stays labeled and grouped by graduation year.",
};

export default function PlayersPage() {
  return <DiscoverBoard />;
}
