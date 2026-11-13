import staffData from "@/data/mens-basketball-staff.json";

export type CoachRole = "head" | "assistant";

export type VerifiedCoach = {
  name: string;
  role: CoachRole;
  title: string;
  email?: string;
  sourceUrl: string;
};

const STAFF = staffData as Record<string, VerifiedCoach[]>;

/** Men's basketball coaches listed on that school's official athletics staff page. Email is present only when that page prints it. */
export function verifiedStaff(collegeId: string): VerifiedCoach[] {
  return STAFF[collegeId] ?? [];
}
