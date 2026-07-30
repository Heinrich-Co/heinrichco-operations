import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth, isCronAuthorized } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Google Calendar → upcoming meetings sync. Reads the next 7 days of events
 * from the configured calendar for the Sales/Operations meeting feeds.
 *
 * Requires: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY,
 * GOOGLE_CALENDAR_ID. Returns {configured:false} when any are missing.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/calendar.readonly"]);
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!auth || !calendarId) {
    return NextResponse.json({
      configured: false,
      message:
        "Calendar sync not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_CALENDAR_ID.",
    });
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
      maxResults: 20,
    });

    const meetings = (resp.data.items ?? []).map((e) => ({
      title: e.summary || "(untitled)",
      when: e.start?.dateTime || e.start?.date || "",
      who: (e.attendees ?? []).map((a) => a.displayName || a.email).join(", "),
    }));

    return NextResponse.json({ configured: true, meetings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "sync failed" },
      { status: 502 }
    );
  }
}
