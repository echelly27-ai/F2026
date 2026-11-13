import { appendFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { verifiedStaff } from "@/lib/basketball-staff";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recentSends: number[] = [];

export type CoachMailInput = {
  collegeId: string;
  coachName: string;
  coachTitle: string;
  replyTo: string;
  subject: string;
  message: string;
};

export type CoachMailResult =
  | { accepted: true; provider: "resend" | "local"; coachName: string }
  | { accepted: false; reason: "no-email" | "rejected" };

function clean(value: string) {
  return value.replace(/[\r\n]/g, " ").trim();
}

/** The published address for this coach on this school's staff record, or null. */
export function publishedCoachAddress(collegeId: string, coachName: string, coachTitle: string) {
  const coach = verifiedStaff(collegeId).find(
    (item) => item.name === coachName && item.title === coachTitle && item.email,
  );
  const address = coach?.email?.trim() ?? "";
  return EMAIL.test(address) ? address : null;
}

function withinRateLimit() {
  const now = Date.now();
  while (recentSends.length && now - recentSends[0] > 60_000) recentSends.shift();
  if (recentSends.length >= 20) return false;
  recentSends.push(now);
  return true;
}

async function sendWithResend(input: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      text: input.text,
    }),
  });
  if (!response.ok) return false;
  const body = (await response.json().catch(() => null)) as { id?: unknown } | null;
  return Boolean(body && typeof body.id === "string" && body.id);
}

async function acceptLocally(record: {
  collegeId: string;
  coachName: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const directory = process.env.COACH_MAIL_OUTBOX?.trim() || path.join(os.tmpdir(), "nextup-coach-mail");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const line = `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`;
  await appendFile(path.join(directory, "outbox.jsonl"), line, { encoding: "utf8", mode: 0o600 });
}

/**
 * Deliver a visitor's note to the published coach address.
 * The recipient always comes from that school's staff record.
 * RESEND_API_KEY sends through Resend. When it is unset, the local mail fallback accepts the message.
 */
export async function deliverCoachMail(input: CoachMailInput): Promise<CoachMailResult> {
  const collegeId = input.collegeId?.trim() ?? "";
  const coachName = input.coachName?.trim() ?? "";
  const coachTitle = input.coachTitle?.trim() ?? "";
  const replyTo = clean(input.replyTo ?? "");
  const subject = clean(input.subject ?? "");
  const message = input.message?.replace(/\r\n/g, "\n").trim() ?? "";
  if (!collegeId || !coachName || !coachTitle || !EMAIL.test(replyTo) || !subject || !message) {
    return { accepted: false, reason: "rejected" };
  }
  if (subject.length > 200 || message.length > 4000 || replyTo.length > 320) {
    return { accepted: false, reason: "rejected" };
  }

  const listed = verifiedStaff(collegeId).find((item) => item.name === coachName && item.title === coachTitle);
  const to = publishedCoachAddress(collegeId, coachName, coachTitle);
  if (!to) {
    return { accepted: false, reason: listed ? "no-email" : "rejected" };
  }
  if (!withinRateLimit()) return { accepted: false, reason: "rejected" };

  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (apiKey) {
    const from = clean(process.env.COACH_MAIL_FROM ?? "");
    if (!from) return { accepted: false, reason: "rejected" };
    const accepted = await sendWithResend({ apiKey, from, to, replyTo, subject, text: message });
    return accepted ? { accepted: true, provider: "resend", coachName } : { accepted: false, reason: "rejected" };
  }

  await acceptLocally({ collegeId, coachName, to, replyTo, subject, text: message });
  return { accepted: true, provider: "local", coachName };
}
