import colleges from "@/data/colleges.json";
import { CHECKED_COLLEGE_FACTS, DEMONSTRATION_OPENINGS } from "@/lib/college-facts";
import { US_STATES } from "@/lib/profile-options";

export type DirectoryCollege = {
  id: string;
  name: string;
  state: string;
  control: "Public" | "Private" | null;
};

export type CollegeSearch = {
  query: string;
  states: string[];
  control: "any" | "Public" | "Private";
  division: string;
  conference: string;
};

/** Sample bands for the results table. These are not admission or roster ratings. */
export const SAMPLE_SELECTIVITY = ["Open", "Typical", "Selective", "Most selective"] as const;
export type SampleSelectivity = (typeof SAMPLE_SELECTIVITY)[number];

export type CollegeResultRow = {
  college: DirectoryCollege;
  city: string;
  division: string;
  conference: string;
  athletic: SampleSelectivity;
  academic: SampleSelectivity;
  inStateTuition: number;
  outStateTuition: number;
  enrollment: number;
  /** True only for a row in the labeled demonstration-opening list. */
  sampleOpening: boolean;
};

export type SortKey =
  | "name"
  | "division"
  | "athletic"
  | "academic"
  | "inState"
  | "outState"
  | "enrollment"
  | "roster";

export type SortDirection = "asc" | "desc";

const DIRECTORY = colleges as DirectoryCollege[];
const BY_ID = new Map(DIRECTORY.map((college) => [college.id, college]));
const STATE_CODES = new Set(US_STATES.map((state) => state.value));
const SAMPLE_OPENING_IDS = new Set<string>(DEMONSTRATION_OPENINGS.map((opening) => opening.collegeId));
const SELECTIVITY_RANK = new Map(SAMPLE_SELECTIVITY.map((label, index) => [label, index]));

export function stateName(code: string) {
  return US_STATES.find((state) => state.value === code)?.label ?? code;
}

export function getDirectoryCollege(id: string) {
  return BY_ID.get(id) ?? null;
}

const BY_NAME = new Map<string, DirectoryCollege[]>();
for (const college of DIRECTORY) {
  const key = college.name.trim().toLowerCase().replace(/\s+/g, " ");
  const list = BY_NAME.get(key);
  if (list) list.push(college);
  else BY_NAME.set(key, [college]);
}

function placeIncludes(place: string, token: string) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(place);
}

/** Match a saved school to the directory page. Duplicate names also need the saved state. */
export function directoryCollegeByName(name: string, location = "") {
  const matches = BY_NAME.get(name.trim().toLowerCase().replace(/\s+/g, " "));
  if (!matches?.length) return null;
  if (matches.length === 1) return matches[0];
  const narrowed = matches.filter(
    (college) => placeIncludes(location, college.state) || placeIncludes(location, stateName(college.state)),
  );
  return narrowed.length === 1 ? narrowed[0] : null;
}

export function directoryCollegeParams() {
  return DIRECTORY.map((college) => ({ id: college.id }));
}

export function collegeLocation(college: DirectoryCollege) {
  const fact = CHECKED_COLLEGE_FACTS[college.id];
  if (fact) return `${fact.city}, ${college.state}`;
  return stateName(college.state);
}

function hashId(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Stable sample figures so the table can sort. Not published costs or rates. */
export function sampleMetrics(id: string, control: DirectoryCollege["control"]) {
  const hash = hashId(id);
  const athletic = SAMPLE_SELECTIVITY[hash % SAMPLE_SELECTIVITY.length];
  const academic = SAMPLE_SELECTIVITY[(hash >>> 4) % SAMPLE_SELECTIVITY.length];
  const enrollment = 800 + (hash % 42000);
  const inStateTuition = (control === "Private" ? 18000 : 6000) + (hash % 28) * 1000;
  const outStateTuition =
    control === "Private" ? inStateTuition : inStateTuition + 8000 + ((hash >>> 8) % 22) * 1000;
  return { athletic, academic, enrollment, inStateTuition, outStateTuition };
}

export function toResultRow(college: DirectoryCollege): CollegeResultRow {
  const fact = CHECKED_COLLEGE_FACTS[college.id];
  const sample = sampleMetrics(college.id, college.control);
  return {
    college,
    city: fact?.city ?? "",
    division: fact?.division ?? "",
    conference: fact?.conference ?? "",
    ...sample,
    sampleOpening: SAMPLE_OPENING_IDS.has(college.id),
  };
}

export function parseCollegeSearch(params: { get(name: string): string | null }): CollegeSearch {
  const control = params.get("control");
  return {
    query: (params.get("q") ?? "").trim(),
    states: (params.get("states") ?? "")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter((code) => STATE_CODES.has(code)),
    control: control === "Public" || control === "Private" ? control : "any",
    division: params.get("division") || "any",
    conference: params.get("conference") || "any",
  };
}

export function collegeSearchParams(search: CollegeSearch) {
  const params = new URLSearchParams();
  if (search.query) params.set("q", search.query);
  if (search.states.length > 0) params.set("states", search.states.join(","));
  if (search.control !== "any") params.set("control", search.control);
  if (search.division !== "any") params.set("division", search.division);
  if (search.conference !== "any") params.set("conference", search.conference);
  return params;
}

export function filterColleges(search: CollegeSearch) {
  const needle = search.query.trim().toLowerCase();
  return DIRECTORY.filter((college) => {
    if (search.states.length > 0 && !search.states.includes(college.state)) return false;
    if (search.control !== "any" && college.control !== search.control) return false;
    const fact = CHECKED_COLLEGE_FACTS[college.id];
    if (search.division !== "any" && fact?.division !== search.division) return false;
    if (search.conference !== "any" && fact?.conference !== search.conference) return false;
    if (!needle) return true;
    return college.name.toLowerCase().includes(needle);
  });
}

export function searchSummary(search: CollegeSearch) {
  const place =
    search.states.length === 0
      ? "All states"
      : search.states.length === 1
        ? stateName(search.states[0])
        : search.states.map(stateName).join(", ");
  return search.query ? `${place} · “${search.query}”` : place;
}

function compareValues(left: string | number, right: string | number, direction: SortDirection) {
  const leftEmpty = left === "" || left === null;
  const rightEmpty = right === "" || right === null;
  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;
  const factor = direction === "asc" ? 1 : -1;
  if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
  return String(left).localeCompare(String(right)) * factor;
}

function sortValue(row: CollegeResultRow, key: SortKey): string | number {
  switch (key) {
    case "name":
      return row.college.name;
    case "division":
      return row.division;
    case "athletic":
      return SELECTIVITY_RANK.get(row.athletic) ?? 0;
    case "academic":
      return SELECTIVITY_RANK.get(row.academic) ?? 0;
    case "inState":
      return row.inStateTuition;
    case "outState":
      return row.outStateTuition;
    case "enrollment":
      return row.enrollment;
    case "roster":
      return row.sampleOpening ? 1 : 0;
    default:
      return row.college.name;
  }
}

export function sortResultRows(rows: CollegeResultRow[], key: SortKey, direction: SortDirection) {
  return [...rows].sort((left, right) => {
    const compared = compareValues(sortValue(left, key), sortValue(right, key), direction);
    if (compared !== 0) return compared;
    const factor = direction === "asc" ? 1 : -1;
    return left.college.name.localeCompare(right.college.name) * factor;
  });
}

export function formatSampleDollars(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSampleCount(amount: number) {
  return new Intl.NumberFormat("en-US").format(amount);
}
