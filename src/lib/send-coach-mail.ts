import { verifiedStaff } from "@/lib/basketball-staff";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENDPOINT = "https://flowform.to/submit";

export type CoachMailRequest = {
  collegeId: string;
  coachName: string;
  coachTitle: string;
  replyTo: string;
  subject: string;
  message: string;
};

export type CoachMailAcceptance =
  | { accepted: true; provider: "flowform" }
  | { accepted: false; reason: "no-email" | "rejected" };

function clean(value: string) {
  return value.replace(/[\r\n]/g, " ").trim();
}

/** The address printed for this coach on this school's staff record. */
export function publishedCoachAddress(collegeId: string, coachName: string, coachTitle: string) {
  const coach = verifiedStaff(collegeId).find((item) => item.name === coachName && item.title === coachTitle);
  const address = coach?.email?.trim() ?? "";
  return EMAIL.test(address) ? address : null;
}

type FlowFormBody = {
  success?: unknown;
};

/**
 * Ask FlowForm to deliver the note. The only recipient is the published staff address.
 * The visitor's email is the reply-to. Nothing is treated as sent unless FlowForm accepts it.
 */
export async function sendCoachMail(input: CoachMailRequest): Promise<CoachMailAcceptance> {
  const collegeId = input.collegeId.trim();
  const coachName = input.coachName.trim();
  const coachTitle = input.coachTitle.trim();
  const replyTo = clean(input.replyTo);
  const subject = clean(input.subject);
  const message = input.message.replace(/\r\n/g, "\n").trim();
  if (!collegeId || !coachName || !coachTitle || !EMAIL.test(replyTo) || !subject || !message) {
    return { accepted: false, reason: "rejected" };
  }
  if (subject.length > 200 || message.length > 4000 || replyTo.length > 320) {
    return { accepted: false, reason: "rejected" };
  }

  const listed = verifiedStaff(collegeId).some((item) => item.name === coachName && item.title === coachTitle);
  const to = publishedCoachAddress(collegeId, coachName, coachTitle);
  if (!to) return { accepted: false, reason: listed ? "no-email" : "rejected" };

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        _to: to,
        _subject: subject,
        _replyto: replyTo,
        email: replyTo,
        message,
      }),
    });
  } catch {
    return { accepted: false, reason: "rejected" };
  }

  const body = (await response.json().catch(() => null)) as FlowFormBody | null;
  if (response.ok && body?.success === true) return { accepted: true, provider: "flowform" };
  return { accepted: false, reason: "rejected" };
}
