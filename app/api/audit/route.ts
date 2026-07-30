import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Illustrative recent activity shown in demo mode (until audit_log has rows).
const SAMPLE = [
  { action: "Marked invoice paid", entity: "invoice", actor: "Camila Heinrich", details: "Ana Ribeiro — € 2,784", created_at: "Today · 09:14" },
  { action: "Approved content", entity: "content", actor: "Camila Heinrich", details: "AI-Native maturity: the 4 stages", created_at: "Today · 08:52" },
  { action: "Updated lead stage", entity: "lead", actor: "Matheus Silva", details: "AkzoNobel → Discovery", created_at: "Yesterday · 17:30" },
  { action: "Ran Darwin — Weekly Pulse", entity: "darwin", actor: "Camila Heinrich", details: "Monday briefing", created_at: "Mon · 07:02" },
];

// GET: recent audit entries (owner view). POST: append an entry.
export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ configured: false, entries: SAMPLE });
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("action,entity,entity_id,details,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ configured: true, entries: data ?? [] });
  } catch {
    return NextResponse.json({ configured: false, entries: SAMPLE });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const result = await logAudit({
    action: String(body.action ?? "action"),
    entity: body.entity ? String(body.entity) : undefined,
    entityId: body.entityId ? String(body.entityId) : undefined,
    details: (body.details as Record<string, unknown>) ?? undefined,
  });
  return NextResponse.json({ ok: true, ...result });
}
