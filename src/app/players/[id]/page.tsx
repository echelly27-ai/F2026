import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerProfileView } from "@/components/players/PlayerProfileView";
import { getPlayer, PROSPECTS } from "@/lib/prospects";
import { RANKING_SOURCE, rankLabel } from "@/lib/rankings";

export function generateStaticParams() {
  return PROSPECTS.map((player) => ({ id: player.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) return { title: "Profile not found" };
  return {
    title: player.name,
    description:
      player.rank == null
        ? `${player.name} is listed without a published rank.`
        : `${player.name}, ${rankLabel(player)} on the public ${RANKING_SOURCE.publisher} ${RANKING_SOURCE.title}. Rankings change.`,
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();
  return <PlayerProfileView player={player} />;
}
