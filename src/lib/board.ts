import type {
  ActivityItem,
  AthleteProfile,
  BoardState,
  ChecklistItem,
  CollegeEntry,
  PlayerNote,
  RecruitStatus,
} from "@/lib/types";
import { STATUSES } from "@/lib/types";

export const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  {
    id: "bio",
    label: "Complete your biography",
    detail: "Add a short bio a coach can scan in one pass.",
    done: false,
  },
  {
    id: "academics",
    label: "Add academic information",
    detail: "GPA and intended major, if you want them on the profile.",
    done: false,
  },
  {
    id: "film",
    label: "Add a highlight link",
    detail: "Paste a YouTube or Hudl URL you control.",
    done: false,
  },
  {
    id: "stats",
    label: "Enter season statistics",
    detail: "Use your own numbers. NEXTUP does not invent a game log.",
    done: false,
  },
  {
    id: "schools",
    label: "Add schools you are researching",
    detail: "Track programs you choose. This is not an offer list.",
    done: false,
  },
  {
    id: "outreach",
    label: "Record an outreach date",
    detail: "Log a date you contacted a program. NEXTUP does not contact coaches.",
    done: false,
  },
  {
    id: "followup",
    label: "Set a follow-up date",
    detail: "A reminder for your own next step.",
    done: false,
  },
  {
    id: "style",
    label: "Describe your playing style",
    detail: "A sentence on how you play.",
    done: false,
  },
];

export function emptyProfile(): AthleteProfile {
  return {
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    heightFeet: "",
    heightInches: "",
    gradYear: "",
    city: "",
    state: "",
    school: "",
    gpa: "",
    intendedMajor: "",
    bio: "",
    playingStyle: "",
    strengths: "",
    ppg: "",
    rpg: "",
    apg: "",
    spg: "",
    bpg: "",
    highlights: [],
  };
}

export function createDefaultBoard(): BoardState {
  return {
    profile: emptyProfile(),
    checklist: CHECKLIST_TEMPLATE.map((item) => ({ ...item })),
    colleges: [
      {
        id: "sample-harborview",
        name: "Harborview University",
        location: "Fictional campus",
        division: "NCAA Division II",
        conference: "Sample conference",
        status: "interested",
        notes:
          "Sample entry. Replace this with a school you are actually researching. No coach is attached.",
        contactDate: "",
        followUpDate: "",
      },
      {
        id: "sample-summit",
        name: "Summit State",
        location: "Fictional campus",
        division: "NCAA Division III",
        conference: "Sample conference",
        status: "evaluating",
        notes:
          "Sample entry in Evaluating. Dates stay empty until you record your own outreach.",
        contactDate: "",
        followUpDate: "",
      },
    ],
    activity: [
      {
        id: "seed",
        text: "Demo board created on this device.",
        at: "",
      },
    ],
    watchlist: [],
    notes: [],
    updatedAt: "",
  };
}

function isStatus(value: unknown): value is RecruitStatus {
  return typeof value === "string" && STATUSES.includes(value as RecruitStatus);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseBoard(value: unknown): BoardState | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<BoardState>;
  if (!raw.profile || typeof raw.profile !== "object") return null;

  const base = createDefaultBoard();
  const profile = raw.profile as Partial<AthleteProfile>;
  const highlights = Array.isArray(profile.highlights)
    ? profile.highlights
        .filter(
          (item): item is AthleteProfile["highlights"][number] =>
            !!item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.url === "string",
        )
        .slice(0, 8)
    : [];

  const doneById = new Map<string, boolean>();
  if (Array.isArray(raw.checklist)) {
    for (const item of raw.checklist) {
      if (item && typeof item.id === "string") doneById.set(item.id, Boolean(item.done));
    }
  }

  const colleges: CollegeEntry[] = Array.isArray(raw.colleges)
    ? raw.colleges
        .filter((item): item is CollegeEntry => !!item && typeof item === "object" && typeof item.id === "string")
        .map((item) => ({
          id: item.id,
          name: asString(item.name).slice(0, 80),
          location: asString(item.location).slice(0, 80),
          division: asString(item.division).slice(0, 40),
          conference: asString(item.conference).slice(0, 80),
          status: isStatus(item.status) ? item.status : "interested",
          notes: asString(item.notes).slice(0, 500),
          contactDate: asString(item.contactDate).slice(0, 10),
          followUpDate: asString(item.followUpDate).slice(0, 10),
        }))
        .filter((item) => item.name.trim().length > 0)
        .slice(0, 40)
    : base.colleges;

  const activity: ActivityItem[] = Array.isArray(raw.activity)
    ? raw.activity
        .filter(
          (item): item is ActivityItem =>
            !!item && typeof item.id === "string" && typeof item.text === "string" && typeof item.at === "string",
        )
        .slice(0, 12)
    : base.activity;

  const notes: PlayerNote[] = Array.isArray(raw.notes)
    ? raw.notes
        .filter(
          (item): item is PlayerNote =>
            !!item &&
            typeof item.playerId === "string" &&
            typeof item.note === "string" &&
            typeof item.savedAt === "string",
        )
        .slice(0, 40)
    : [];

  return {
    profile: {
      ...emptyProfile(),
      ...Object.fromEntries(
        Object.entries(emptyProfile()).map(([key, fallback]) => {
          if (key === "highlights") return [key, highlights];
          const incoming = profile[key as keyof AthleteProfile];
          return [key, typeof incoming === "string" ? incoming.slice(0, 600) : fallback];
        }),
      ),
      highlights,
    } as AthleteProfile,
    checklist: base.checklist.map((item) => ({
      ...item,
      done: doneById.get(item.id) ?? false,
    })),
    colleges,
    activity,
    watchlist: Array.isArray(raw.watchlist)
      ? raw.watchlist.filter((item): item is string => typeof item === "string").slice(0, 40)
      : [],
    notes,
    updatedAt: asString(raw.updatedAt) || new Date().toISOString(),
  };
}

export function withActivity(items: ActivityItem[], text: string): ActivityItem[] {
  return [
    {
      id: crypto.randomUUID(),
      text,
      at: new Date().toISOString(),
    },
    ...items,
  ].slice(0, 12);
}

const COMPLETION_CHECKS: Array<{ label: string; ok: (profile: AthleteProfile) => boolean }> = [
  { label: "First name", ok: (profile) => profile.firstName.trim().length > 1 },
  { label: "Last name", ok: (profile) => profile.lastName.trim().length > 0 },
  { label: "Email", ok: (profile) => profile.email.trim().length > 0 },
  { label: "Position", ok: (profile) => profile.position.trim().length > 0 },
  { label: "Height", ok: (profile) => profile.heightFeet.trim().length > 0 },
  { label: "Graduation year", ok: (profile) => profile.gradYear.trim().length > 0 },
  { label: "City", ok: (profile) => profile.city.trim().length > 0 },
  { label: "State", ok: (profile) => profile.state.trim().length > 0 },
  { label: "School", ok: (profile) => profile.school.trim().length > 0 },
  { label: "GPA", ok: (profile) => profile.gpa.trim().length > 0 },
  { label: "Intended major", ok: (profile) => profile.intendedMajor.trim().length > 0 },
  { label: "Biography", ok: (profile) => profile.bio.trim().length > 0 },
  { label: "Playing style", ok: (profile) => profile.playingStyle.trim().length > 0 },
  { label: "Strengths", ok: (profile) => profile.strengths.trim().length > 0 },
  { label: "Scoring average", ok: (profile) => profile.ppg.trim().length > 0 },
  { label: "Rebounding average", ok: (profile) => profile.rpg.trim().length > 0 },
  { label: "Assist average", ok: (profile) => profile.apg.trim().length > 0 },
  { label: "Highlight link", ok: (profile) => profile.highlights.length > 0 },
];

export function profileCompletion(profile: AthleteProfile) {
  const missing = COMPLETION_CHECKS.filter((check) => !check.ok(profile)).map((check) => check.label);
  const total = COMPLETION_CHECKS.length;
  const filled = total - missing.length;
  return {
    percent: Math.round((filled / total) * 100),
    filled,
    total,
    missing,
  };
}

export function statusCounts(colleges: CollegeEntry[]) {
  return {
    interested: colleges.filter((college) => college.status === "interested").length,
    contacted: colleges.filter((college) => college.status === "contacted").length,
    evaluating: colleges.filter((college) => college.status === "evaluating").length,
  };
}

export function nextFollowUp(colleges: CollegeEntry[]) {
  const dates = colleges
    .map((college) => college.followUpDate)
    .filter(Boolean)
    .sort();
  return dates[0] ?? "";
}
