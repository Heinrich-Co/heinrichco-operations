import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth, isCronAuthorized } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase-server";
import { headerIndex, pick, num, str } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Google Sheets → Supabase sync (Vercel Cron, every 15 min).
 * Syncs the Payables sheet into `invoices`, mapping columns BY NAME from the
 * header row so the sheet's column order can change without breaking the sync.
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
  const tab = process.env.PAYABLES_TAB || "Payables";

  if (!auth || !supabase || !sheetId) {
    return NextResponse.json({
      configured: false,
      message:
        "Sheets sync not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, PAYABLES_SHEET_ID and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });
    // Read the whole tab, header included, so we can map by column name.
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tab}!A1:Z`,
    });
    const values = resp.data.values ?? [];
    if (values.length < 2) {
      return NextResponse.json({ configured: true, synced: 0, message: "No data rows." });
    }
    const idx = headerIndex(values[0]);
    const rows = values.slice(1);

    // Column names are matched case/space/accent-insensitively (see lib/sheets),
    // so header order — and English vs Portuguese labels — don't matter.
    const records = rows
      .map((r, i) => {
        const vendor = str(pick(r, idx, ["vendor", "fornecedor", "supplier", "payee"]));
        if (!vendor) return null;
        const amountEur = num(
          pick(r, idx, ["amount_eur", "amount (eur)", "valor_eur", "valor (eur)", "amount", "valor"])
        );
        const rawStatus = str(pick(r, idx, ["status", "estado"])) || "Pending";
        return {
          date_received: str(pick(r, idx, ["date_received", "date received", "received", "data recebido"])) || null,
          invoice_date: str(pick(r, idx, ["invoice_date", "invoice date", "data fatura", "data"])) || null,
          vendor,
          invoice_number: str(pick(r, idx, ["invoice_number", "invoice number", "invoice #", "invoice", "nº fatura", "numero fatura", "fatura"])) || null,
          amount: amountEur,
          amount_eur: amountEur,
          currency: str(pick(r, idx, ["currency", "moeda"])) || "EUR",
          due_date: str(pick(r, idx, ["due_date", "due date", "due", "vencimento", "data vencimento"])) || null,
          // days_left is free-form text ("Overdue", "Due today", "12") — keep as text.
          days_left: str(pick(r, idx, ["days_left", "days left", "dias restantes", "prazo"])) || null,
          status: normalizeStatus(rawStatus),
          category: str(pick(r, idx, ["category", "categoria"])) || null,
          description: str(pick(r, idx, ["description", "descrição", "descricao", "notes", "notas"])) || null,
          drive_link: str(pick(r, idx, ["drive_link", "drive link", "invoice_link", "link", "attachment", "anexo"])) || null,
          msg_id: str(pick(r, idx, ["msg_id", "message_id", "message id", "email_id", "gmail_id"])) || null,
          email_subject: str(pick(r, idx, ["email_subject", "email subject", "subject", "assunto"])) || null,
          notes: str(pick(r, idx, ["notes", "notas", "observações", "observacoes", "comments"])) || null,
          sheet_row: i + 2,
          synced_at: new Date().toISOString(),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const { error } = await supabase
      .from("invoices")
      .upsert(records, { onConflict: "sheet_row" });
    if (error) throw error;

    await logAutomation(supabase, "Payables sync (Sheet → Supabase)", "running", null);

    return NextResponse.json({ configured: true, synced: records.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sync failed";
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) await logAutomation(supabaseAdmin, "Payables sync (Sheet → Supabase)", "error", message);
    return NextResponse.json({ error: message }, { status: 502 });

  }
}

// Map any sheet status text onto the invoices CHECK constraint (Pending/Overdue/Paid).
function normalizeStatus(raw: string): "Pending" | "Overdue" | "Paid" {
  const s = raw.toLowerCase();
  if (s.includes("paid") || s.includes("pago")) return "Paid";
  if (s.includes("overdue") || s.includes("late") || s.includes("atras") || s.includes("venc")) return "Overdue";
  return "Pending";
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
