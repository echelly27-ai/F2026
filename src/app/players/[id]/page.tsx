import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerProfileView } from "@/components/players/PlayerProfileView";
import { DEMO_PLAYERS, getPlayer } from "@/lib/demo-players";

export function generateStaticParams() {
  return DEMO_PLAYERS.map((player) => ({ id: player.id }));
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
    description: `Fictional NEXTUP demonstration profile for ${player.name}. Not a real recruit.`,
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();
  return <PlayerProfileView player={player} />;
}
