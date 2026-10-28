import type { Position, Prospect } from "@/lib/types";

export type HeightFilter = "any" | "lt70" | "70-74" | "75-78" | "79plus";
export type SortKey = "rank" | "stars" | "name" | "year" | "height" | "position";
export type RankFilter = "any" | "1-10" | "11-25" | "26-50" | "51-100" | "unranked";
export type StarFilter = "any" | "5" | "4";

export interface PlayerFilters {
  query: string;
  position: Position | "any";
  gradYear: string;
  height: HeightFilter;
  state: string;
  school: string;
  rank: RankFilter;
  stars: StarFilter;
  sort: SortKey;
}

export const INITIAL_FILTERS: PlayerFilters = {
  query: "",
  position: "any",
  gradYear: "any",
  height: "any",
  state: "any",
  school: "",
  rank: "any",
  stars: "any",
  sort: "rank",
};

function matchesHeight(inches: number, filter: HeightFilter) {
  if (filter === "lt70") return inches < 70;
  if (filter === "70-74") return inches >= 70 && inches <= 74;
  if (filter === "75-78") return inches >= 75 && inches <= 78;
  if (filter === "79plus") return inches >= 79;
  return true;
}

function matchesRank(rank: number | null, filter: RankFilter) {
  if (filter === "unranked") return rank == null;
  if (rank == null) return filter === "any";
  if (filter === "1-10") return rank >= 1 && rank <= 10;
  if (filter === "11-25") return rank >= 11 && rank <= 25;
  if (filter === "26-50") return rank >= 26 && rank <= 50;
  if (filter === "51-100") return rank >= 51 && rank <= 100;
  return true;
}

function byRank(a: Prospect, b: Prospect) {
  if (a.rank == null && b.rank == null) return a.name.localeCompare(b.name);
  if (a.rank == null) return 1;
  if (b.rank == null) return -1;
  return a.rank - b.rank;
}

export function filterPlayers(players: Prospect[], filters: PlayerFilters) {
  const query = filters.query.trim().toLowerCase();
  const school = filters.school.trim().toLowerCase();
  const result = players.filter((player) => {
    if (query) {
      const haystack = `${player.name} ${player.school} ${player.hometown} ${player.city}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (school && !player.school.toLowerCase().includes(school)) return false;
    if (filters.position !== "any" && player.position !== filters.position) return false;
    if (filters.gradYear !== "any" && String(player.gradYear) !== filters.gradYear) return false;
    if (filters.state !== "any" && player.state !== filters.state) return false;
    if (!matchesHeight(player.heightInches, filters.height)) return false;
    if (!matchesRank(player.rank, filters.rank)) return false;
    if (filters.stars !== "any" && player.stars !== Number(filters.stars)) return false;
    return true;
  });

  result.sort((a, b) => {
    if (filters.sort === "year") {
      return a.gradYear - b.gradYear || byRank(a, b);
    }
    if (filters.sort === "height") {
      return b.heightInches - a.heightInches || byRank(a, b);
    }
    if (filters.sort === "position") {
      return a.position.localeCompare(b.position) || byRank(a, b);
    }
    if (filters.sort === "stars") {
      return b.stars - a.stars || byRank(a, b);
    }
    if (filters.sort === "name") {
      return a.name.localeCompare(b.name);
    }
    return byRank(a, b);
  });

  return result;
}
