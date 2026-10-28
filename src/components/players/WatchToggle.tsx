"use client";

import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";

export function WatchToggle({
  playerId,
  playerName,
  compact = false,
}: {
  playerId: string;
  playerName: string;
  compact?: boolean;
}) {
  const { ready, board, toggleWatch } = useApp();
  const saved = board.watchlist.includes(playerId);

  return (
    <Button
      size={compact ? "sm" : "md"}
      variant={saved ? "secondary" : "primary"}
      disabled={!ready}
      aria-pressed={saved}
      onClick={() => toggleWatch(playerId, playerName)}
    >
      {saved ? "On watchlist" : "Save to watchlist"}
    </Button>
  );
}
