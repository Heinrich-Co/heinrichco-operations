import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

// Stores a Web Push subscription so the server can notify this device later.
// Requires SUPABASE_SERVICE_ROLE_KEY + a `push_subscriptions` table (schema.sql).
export async function POST(req: NextRequest) {
  let sub: unknown;
  try {
    sub = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      message: "Push storage not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const endpoint = (sub as { endpoint?: string })?.endpoint;
  if (!endpoint) return NextResponse.json({ error: "missing endpoint" }, { status: 400 });

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ endpoint, subscription: sub }, { onConflict: "endpoint" });

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json({ configured: true, ok: true });
}
