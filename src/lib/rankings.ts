import { RANKING_SOURCE } from "@/lib/prospects";
import type { Prospect } from "@/lib/types";

export { RANKING_SOURCE };

export function isRanked(player: Prospect): player is Prospect & { rank: number } {
  return typeof player.rank === "number";
}

export function rankLabel(player: Prospect) {
  return isRanked(player) ? `No. ${player.rank}` : "Unranked";
}

function byPublishedRank(a: Prospect, b: Prospect) {
  if (!isRanked(a) && !isRanked(b)) return a.name.localeCompare(b.name);
  if (!isRanked(a)) return 1;
  if (!isRanked(b)) return -1;
  return a.rank - b.rank;
}

export function groupByGraduationClass(players: Prospect[]) {
  const years = Array.from(new Set(players.map((player) => player.gradYear))).sort((a, b) => a - b);
  return years.map((year) => {
    const classPlayers = players.filter((player) => player.gradYear === year).sort(byPublishedRank);
    return {
      year,
      players: classPlayers,
      ranked: classPlayers.filter(isRanked).length,
      unranked: classPlayers.filter((player) => !isRanked(player)).length,
    };
  });
}
