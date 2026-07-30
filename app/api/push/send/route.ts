import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/google";
import { sendPushToAll } from "@/lib/push-server";

export const runtime = "nodejs";

// Sends a push notification to all subscribed devices. Protect with CRON_SECRET
// (Bearer token) so only trusted callers (cron / server actions) can trigger it.
export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload = { title: "Heinrich Co. Operations", body: "You have a new alert.", url: "/" };
  try {
    const body = await req.json();
    payload = { ...payload, ...body };
  } catch {
    /* defaults */
  }

  const result = await sendPushToAll(payload);
  if (!result.configured) {
    return NextResponse.json({
      configured: false,
      message: "Push not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }
  return NextResponse.json(result);
}
