import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

// Creates a content item natively (content is managed in-app, not Notion).
// No-ops (configured:false) in demo mode; the Kanban keeps client-side state.
export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, configured: false });

  try {
    const { data, error } = await supabase
      .from("content")
      .insert({
        title: body.title,
        content_type: body.content_type ?? "Blog",
        platform: body.platform ?? null,
        approval_status: body.status ?? "Draft",
      })
      .select("id")
      .single();
    if (error) throw error;
    await logAudit({ action: "Created content", entity: "content", entityId: String(data?.id), details: { title: body.title } });
    return NextResponse.json({ ok: true, configured: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 502 }
    );
  }
}
