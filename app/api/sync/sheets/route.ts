import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth, isCronAuthorized } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Google Sheets → Supabase sync (Vercel Cron, every 15 min).
 * Syncs the Payables sheet into `invoices`. The same pattern extends to the
 * Lead Intake and Website Bookings tabs (see mapRow variants below).
 *
 * Requires: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY,
 * PAYABLES_SHEET_ID, and SUPABASE_SERVICE_ROLE_KEY. Returns {configured:false}
 * when any are missing so the cron is a no-op until wired up.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"]);
  const supabase = createAdminClient();
  const sheetId = process.env.PAYABLES_SHEET_ID;

  if (!auth || !supabase || !sheetId) {
    return NextResponse.json({
      configured: false,
      message:
        "Sheets sync not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, PAYABLES_SHEET_ID and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Payables!A2:J",
    });
    const rows = resp.data.values ?? [];

    // Column order: date_received, vendor, invoice_number, amount, currency,
    // due_date, status, category, notes, email_subject.
    const records = rows
      .filter((r) => r[1]) // vendor present
      .map((r, i) => ({
        date_received: r[0] || null,
        vendor: r[1],
        invoice_number: r[2] || null,
        amount: r[3] ? parseFloat(String(r[3]).replace(/[^0-9.]/g, "")) : null,
        currency: r[4] || "EUR",
        due_date: r[5] || null,
        status: (r[6] as string) || "Pending",
        category: r[7] || null,
        notes: r[8] || null,
        email_subject: r[9] || null,
        sheet_row: i + 2,
        synced_at: new Date().toISOString(),
      }));

    const { error } = await supabase
      .from("invoices")
      .upsert(records, { onConflict: "sheet_row" });
    if (error) throw error;

    await logAutomation(supabase, "Booking sync (Sheet → Supabase)", "running", null);

    return NextResponse.json({ configured: true, synced: records.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sync failed";
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) await logAutomation(supabaseAdmin, "Invoice capture (Gmail scan)", "error", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function logAutomation(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  name: string,
  state: "running" | "error",
  lastError: string | null
) {
  try {
    await supabase
      .from("automations")
      .upsert(
        {
          name,
          state,
          last_run: new Date().toISOString(),
          last_error: lastError,
        },
        { onConflict: "name" }
      );
  } catch {
    /* automations table optional — ignore logging failures */
  }
}
