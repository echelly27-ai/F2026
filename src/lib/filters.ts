import type { Position, Prospect } from "@/lib/types";

export type HeightFilter = "any" | "lt70" | "70-74" | "75-78" | "79plus";
export type SortKey = "rank" | "stars" | "name" | "year" | "height" | "position";
export type RankFilter = "any" | "1-10" | "11-25" | "26-50" | "51-100";
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

function matchesRank(rank: number, filter: RankFilter) {
  if (filter === "1-10") return rank >= 1 && rank <= 10;
  if (filter === "11-25") return rank >= 11 && rank <= 25;
  if (filter === "26-50") return rank >= 26 && rank <= 50;
  if (filter === "51-100") return rank >= 51 && rank <= 100;
  return true;
}

export function filterPlayers(players: Prospect[], filters: PlayerFilters) {
  const query = filters.query.trim().toLowerCase();
  const school = filters.school.trim().toLowerCase();
  const result = players.filter((player) => {
    if (query && !player.name.toLowerCase().includes(query)) return false;
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
      return a.gradYear - b.gradYear || a.rank - b.rank;
    }
    if (filters.sort === "height") {
      return b.heightInches - a.heightInches || a.rank - b.rank;
    }
    if (filters.sort === "position") {
      return a.position.localeCompare(b.position) || a.rank - b.rank;
    }
    if (filters.sort === "stars") {
      return b.stars - a.stars || a.rank - b.rank;
    }
    if (filters.sort === "name") {
      return a.name.localeCompare(b.name);
    }
    return a.rank - b.rank;
  });

  return result;
}
