import type { AthleteProfile, CollegeEntry } from "@/lib/types";
import { todayISO } from "@/lib/format";
import { safeHttpsUrl } from "@/lib/media";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDemoSignIn(name: string, email: string) {
  const errors: Record<string, string> = {};
  if (name.trim().length < 2) {
    errors.name = "Enter the name you want on this demo session.";
  } else if (name.trim().length > 60) {
    errors.name = "Use 60 characters or fewer.";
  }
  if (!EMAIL.test(email.trim())) {
    errors.email = "Enter a valid email. In demo mode it stays in this browser.";
  }
  return errors;
}

export function validateSupabaseAuth(email: string, password: string) {
  const errors: Record<string, string> = {};
  if (!EMAIL.test(email.trim())) errors.email = "Enter the email for your Supabase account.";
  if (password.length < 6) errors.password = "Use at least 6 characters.";
  return errors;
}

export function validateProfile(profile: AthleteProfile) {
  const errors: Record<string, string> = {};
  if (profile.firstName.trim().length < 2) errors.firstName = "Enter a first name.";
  if (!profile.lastName.trim()) errors.lastName = "Enter a last name.";
  if (profile.email.trim() && !EMAIL.test(profile.email.trim())) {
    errors.email = "Enter a valid email or leave it blank.";
  }
  if (profile.gpa.trim()) {
    const gpa = Number(profile.gpa);
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 5) {
      errors.gpa = "GPA should be a number from 0 to 5.00.";
    }
  }
  if (profile.gradYear.trim() && !/^(202[5-9]|203[0-2])$/.test(profile.gradYear.trim())) {
    errors.gradYear = "Use a graduation year from 2025 to 2032.";
  }
  if (profile.heightFeet.trim()) {
    const feet = Number(profile.heightFeet);
    if (!Number.isInteger(feet) || feet < 4 || feet > 8) errors.heightFeet = "Feet should be from 4 to 8.";
  }
  if (profile.heightInches.trim()) {
    const inches = Number(profile.heightInches);
    if (!Number.isInteger(inches) || inches < 0 || inches > 11) {
      errors.heightInches = "Inches should be from 0 to 11.";
    }
  }
  for (const key of ["ppg", "rpg", "apg", "spg", "bpg"] as const) {
    const raw = profile[key].trim();
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 50) {
      errors[key] = "Enter a number from 0 to 50.";
    }
  }
  if (profile.bio.length > 600) errors.bio = "Keep the bio under 600 characters.";
  if (profile.playingStyle.length > 300) errors.playingStyle = "Keep the playing style under 300 characters.";
  return errors;
}

export function validateCollege(input: Pick<CollegeEntry, "name" | "division" | "notes" | "contactDate" | "followUpDate">) {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 2) errors.name = "Enter the school name.";
  if (input.name.trim().length > 80) errors.name = "Use 80 characters or fewer.";
  if (!input.division.trim()) errors.division = "Choose a division.";
  if (input.contactDate && input.contactDate > todayISO()) {
    errors.contactDate = "Outreach date cannot be in the future. Record a date you already reached out.";
  }
  if (input.followUpDate && input.contactDate && input.followUpDate < input.contactDate) {
    errors.followUpDate = "Follow-up should be on or after the outreach date.";
  }
  if (input.notes.length > 500) errors.notes = "Keep notes under 500 characters.";
  return errors;
}

export function validateHighlight(title: string, url: string) {
  const errors: Record<string, string> = {};
  if (title.trim().length < 2) errors.title = "Name this film link.";
  if (!safeHttpsUrl(url)) errors.url = "Paste a full https link, such as a YouTube or Hudl URL.";
  return errors;
}
