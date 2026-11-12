import staffData from "@/data/mens-basketball-staff.json";

export type CoachRole = "head" | "assistant";

export type VerifiedCoach = {
  name: string;
  role: CoachRole;
  title: string;
  email: string;
  sourceUrl: string;
};

const STAFF = staffData as Record<string, VerifiedCoach[]>;

/** Men's basketball coaches whose email was copied from that school's official athletics staff page. */
export function verifiedStaff(collegeId: string): VerifiedCoach[] {
  return STAFF[collegeId] ?? [];
}
