import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth, isCronAuthorized } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase-server";
import { headerIndex, pick, num, str } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Presto Lead Intake → Supabase sync (Vercel Cron, every 15 min).
 *
 * Reads the Lead Intake sheet BY COLUMN NAME (Portuguese OR English headers),
 * tags every row Source = "Presto", normalizes the agency's free-form status
 * into our canonical pipeline stages, and upserts by sheet_row.
 *
 * Requires: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY,
 * LEAD_INTAKE_SHEET_ID, and SUPABASE_SERVICE_ROLE_KEY. Returns {configured:false}
 * when any are missing so the cron is a no-op until wired up.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"]);
  const supabase = createAdminClient();
  const sheetId = process.env.LEAD_INTAKE_SHEET_ID;
  const tab = process.env.LEAD_INTAKE_TAB || "Lead Intake";

  if (!auth || !supabase || !sheetId) {
    return NextResponse.json({
      configured: false,
      message:
        "Lead intake sync not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, LEAD_INTAKE_SHEET_ID and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });
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

    const records = rows
      .map((r, i) => {
        const name = str(pick(r, idx, ["nome", "name", "lead", "contato", "contact"]));
        if (!name) return null;
        const proposalValue = num(pick(r, idx, ["valor proposta", "proposal value", "valor_proposta", "proposta valor"]));
        const dealValue = num(pick(r, idx, ["valor venda", "sale value", "deal value", "valor_venda", "venda valor"]));
        const rawStatus = str(pick(r, idx, ["status", "estado", "stage", "etapa", "fase"])) || "";
        const stage = normalizeStage(rawStatus, proposalValue, dealValue);
        return {
          name,
          company: str(pick(r, idx, ["empresa", "company", "organização", "organizacao"])) || null,
          title: str(pick(r, idx, ["cargo", "title", "role", "position", "função", "funcao"])) || null,
          linkedin: str(pick(r, idx, ["linkedin", "linkedin url", "perfil linkedin"])) || null,
          campaign: str(pick(r, idx, ["campanha", "campaign"])) || null,
          source: "Presto",
          stage,
          proposal_value: proposalValue,
          deal_value: dealValue,
          notes: str(pick(r, idx, ["comentários", "comentarios", "comments", "notes", "notas", "observações", "observacoes"])) || null,
          sheet_row: i + 2,
          synced_at: new Date().toISOString(),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const { error } = await supabase
      .from("leads")
      .upsert(records, { onConflict: "sheet_row" });
    if (error) throw error;

    await logAutomation(supabase, "Presto lead intake (Sheet → Supabase)", "running", null);

    return NextResponse.json({ configured: true, synced: records.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sync failed";
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) await logAutomation(supabaseAdmin, "Presto lead intake (Sheet → Supabase)", "error", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

const STAGE_RANK: Record<string, number> = {
  New: 0,
  Contacted: 1,
  Responded: 2,
  Discovery: 3,
  Proposal: 4,
  Negotiation: 5,
  "Closed-Won": 6,
  "Closed-Lost": 6,
  Nurture: 1,
};

/*
 * Map the agency's free-form status onto our canonical pipeline stages, then let
 * the money columns win: any proposal value implies at least Proposal, any sale
 * value implies Closed-Won.
 *
 *   Resposta neutra                         → Responded
 *   Agendou reunião / Reunião realizada     → Discovery
 *   Proposta                                → Proposal
 *   Venda                                   → Closed-Won
 */
function normalizeStage(
  raw: string,
  proposalValue: number | null,
  dealValue: number | null
): string {
  const s = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  let stage = "New";
  if (!s) stage = "New";
  else if (/venda|won|ganho|fechado|closed[- ]?won/.test(s)) stage = "Closed-Won";
  else if (/perdid|lost|closed[- ]?lost|nao interesse|sem interesse|declin/.test(s)) stage = "Closed-Lost";
  else if (/propost|proposal/.test(s)) stage = "Proposal";
  else if (/negocia|negotiat/.test(s)) stage = "Negotiation";
  else if (/reuni|meeting|agend|discovery|descoberta|call/.test(s)) stage = "Discovery";
  else if (/resposta|respond|neutr|reply|replied/.test(s)) stage = "Responded";
  else if (/nurtur|nutri|follow[- ]?up|acompanh/.test(s)) stage = "Nurture";
  else if (/contact|contato|conectad|connected|conexao/.test(s)) stage = "Contacted";

  // Money columns override an earlier-looking status.
  if (dealValue && dealValue > 0) return "Closed-Won";
  if (proposalValue && proposalValue > 0 && (STAGE_RANK[stage] ?? 0) < STAGE_RANK.Proposal) {
    return "Proposal";
  }
  return stage;
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
