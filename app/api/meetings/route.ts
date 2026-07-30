import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/google";
import { MEETINGS } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Upcoming meetings — Camila's real Google Calendar (next 7 days) when
// configured, otherwise the seed meetings. Powers the meeting-prep feed.
export async function GET() {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/calendar.readonly"]);
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!auth || !calendarId) {
    return NextResponse.json({ configured: false, meetings: MEETINGS });
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const resp = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: in7.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 12,
    });

    const meetings = (resp.data.items ?? []).map((e) => {
      const start = e.start?.dateTime || e.start?.date || "";
      const when = start
        ? new Date(start).toLocaleString("en-GB", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      return {
        title: e.summary || "(untitled)",
        when,
        who: (e.attendees ?? []).map((a) => a.displayName || a.email).filter(Boolean).join(", "),
      };
    });

    return NextResponse.json({ configured: true, meetings });
  } catch {
    return NextResponse.json({ configured: false, meetings: MEETINGS });
  }
}
