import type { Metadata } from "next";
import { ChallengesBoard } from "@/components/challenges/ChallengesBoard";

export const metadata: Metadata = {
  title: "Eight Challenges",
  description:
    "Eight Matter.js simulations for the Fall Hack-a-Thon 2026: gravity, mixed bodies, mouse dragging, dynamic counts, collisions, extra forces, constraints, and live stats.",
};

export default function ChallengesPage() {
  return <ChallengesBoard />;
}
