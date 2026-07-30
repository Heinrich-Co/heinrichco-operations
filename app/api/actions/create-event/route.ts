import { NextRequest, NextResponse } from "next/server";
import { getDelegatedAuth, google } from "@/lib/actions-google";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

// Creates a follow-up calendar event. Uses Google Calendar when delegation is
// configured, otherwise echoes the proposed event (compose-only).
export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const title = String(body.title ?? "Follow-up");
  const attendees: string[] = Array.isArray(body.attendees) ? body.attendees : [];
  // Default: tomorrow 10:00 for 30 minutes (client can override with ISO start).
  const startIso = String(body.start ?? "");
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const auth = getDelegatedAuth(["https://www.googleapis.com/auth/calendar.events"]);
  if (!auth || !startIso) {
    return NextResponse.json({
      configured: Boolean(auth),
      created: false,
      event: { title, start: startIso || "tomorrow 10:00", attendees },
    });
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const start = new Date(startIso);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: title,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: attendees.map((email) => ({ email })),
      },
    });
    await logAudit({ action: "Created follow-up event", entity: "calendar", details: { title } });
    return NextResponse.json({ configured: true, created: true, event: { id: res.data.id, title } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 502 }
    );
  }
}
