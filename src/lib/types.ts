export const POSITIONS = [
  "Point Guard",
  "Shooting Guard",
  "Small Forward",
  "Power Forward",
  "Center",
] as const;

export type Position = (typeof POSITIONS)[number];

export const STATUSES = ["interested", "contacted", "evaluating"] as const;

export type RecruitStatus = (typeof STATUSES)[number];

export const DIVISIONS = [
  "NCAA Division I",
  "NCAA Division II",
  "NCAA Division III",
  "NAIA",
  "JUCO",
  "Other",
] as const;

export type Division = (typeof DIVISIONS)[number];

export interface Highlight {
  id: string;
  title: string;
  url: string;
}

export interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  games: number;
}

export interface DemoPlayer {
  id: string;
  name: string;
  position: Position;
  heightInches: number;
  gradYear: number;
  city: string;
  state: string;
  school: string;
  gpa: number | null;
  sat: number | null;
  intendedMajor: string;
  photo: string;
  photoAlt: string;
  stats: PlayerStats;
  strengths: string[];
  playingStyle: string;
  highlights: Highlight[];
  collegeInterests: string[];
  bio: string;
}

export interface AthleteProfile {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  heightFeet: string;
  heightInches: string;
  gradYear: string;
  city: string;
  state: string;
  school: string;
  gpa: string;
  intendedMajor: string;
  bio: string;
  playingStyle: string;
  strengths: string;
  ppg: string;
  rpg: string;
  apg: string;
  spg: string;
  bpg: string;
  highlights: Highlight[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
}

export interface CollegeEntry {
  id: string;
  name: string;
  location: string;
  division: string;
  conference: string;
  status: RecruitStatus;
  notes: string;
  contactDate: string;
  followUpDate: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  at: string;
}

export interface PlayerNote {
  playerId: string;
  note: string;
  savedAt: string;
}

export interface BoardState {
  profile: AthleteProfile;
  checklist: ChecklistItem[];
  colleges: CollegeEntry[];
  activity: ActivityItem[];
  watchlist: string[];
  notes: PlayerNote[];
  updatedAt: string;
}

export interface Session {
  mode: "demo" | "supabase";
  name: string;
  email: string;
  userId?: string;
}
