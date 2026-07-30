import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/*
 * Persists an approval / stage change and records it in the audit log.
 *   { type: "content", id, status, title, actor }  → content.approval_status
 *   { type: "lead", id, stage, name, actor }        → leads.stage
 * In demo mode it no-ops (configured:false) but still returns ok so the UI can
 * confirm optimistically.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const type = String(body.type ?? "");

  if (!supabase) {
    return NextResponse.json({ ok: true, configured: false });
  }

  try {
    if (type === "content" && body.id != null) {
      await supabase
        .from("content")
        .update({ approval_status: body.status ?? "Approved" })
        .eq("id", body.id);
      await logAudit({
        action: `Content ${String(body.status ?? "approved").toLowerCase()}`,
        entity: "content",
        entityId: String(body.id),
        details: { title: body.title },
      });
    } else if (type === "lead" && body.id != null) {
      await supabase.from("leads").update({ stage: body.stage }).eq("id", body.id);
      await logAudit({
        action: "Updated lead stage",
        entity: "lead",
        entityId: String(body.id),
        details: { name: body.name, stage: body.stage },
      });
    } else {
      return NextResponse.json({ error: "unknown approval type" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, configured: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 502 }
    );
  }
}
