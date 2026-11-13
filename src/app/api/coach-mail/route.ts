import { deliverCoachMail } from "@/lib/coach-mail";

function textField(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ accepted: false }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return Response.json({ accepted: false }, { status: 400 });
  }

  const record = payload as Record<string, unknown>;
  const result = await deliverCoachMail({
    collegeId: textField(record.collegeId),
    coachName: textField(record.coachName),
    coachTitle: textField(record.coachTitle),
    replyTo: textField(record.replyTo),
    subject: textField(record.subject),
    message: textField(record.message),
  });

  if (!result.accepted) {
    return Response.json(
      { accepted: false, reason: result.reason },
      { status: result.reason === "no-email" ? 409 : 400 },
    );
  }

  return Response.json({ accepted: true, provider: result.provider, coachName: result.coachName });
}
