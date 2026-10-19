import type { DemoPlayer, Position } from "@/lib/types";

export type HeightFilter = "any" | "lt70" | "70-74" | "75-78" | "79plus";
export type SortKey = "name" | "year" | "height" | "position";

export interface PlayerFilters {
  query: string;
  position: Position | "any";
  gradYear: string;
  height: HeightFilter;
  state: string;
  sort: SortKey;
}

export const INITIAL_FILTERS: PlayerFilters = {
  query: "",
  position: "any",
  gradYear: "any",
  height: "any",
  state: "any",
  sort: "name",
};

function matchesHeight(inches: number, filter: HeightFilter) {
  if (filter === "lt70") return inches < 70;
  if (filter === "70-74") return inches >= 70 && inches <= 74;
  if (filter === "75-78") return inches >= 75 && inches <= 78;
  if (filter === "79plus") return inches >= 79;
  return true;
}

export function filterPlayers(players: DemoPlayer[], filters: PlayerFilters) {
  const query = filters.query.trim().toLowerCase();
  const result = players.filter((player) => {
    if (query && !player.name.toLowerCase().includes(query)) return false;
    if (filters.position !== "any" && player.position !== filters.position) return false;
    if (filters.gradYear !== "any" && String(player.gradYear) !== filters.gradYear) return false;
    if (filters.state !== "any" && player.state !== filters.state) return false;
    if (!matchesHeight(player.heightInches, filters.height)) return false;
    return true;
  });

  result.sort((a, b) => {
    if (filters.sort === "year") {
      return a.gradYear - b.gradYear || a.name.localeCompare(b.name);
    }
    if (filters.sort === "height") {
      return b.heightInches - a.heightInches || a.name.localeCompare(b.name);
    }
    if (filters.sort === "position") {
      return a.position.localeCompare(b.position) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return result;
}
