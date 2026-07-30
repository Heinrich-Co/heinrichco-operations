import { NextRequest } from "next/server";
import { DARWIN_SAMPLES } from "@/lib/data";
import { matchDarwin } from "@/lib/format";

export const runtime = "nodejs";

// Returns the closest canned Darwin response as plain text. Used by the client
// as a last-resort fallback if the streaming endpoint fails.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "Weekly Pulse";
  const text = DARWIN_SAMPLES[key] || DARWIN_SAMPLES[matchDarwin(key)] || DARWIN_SAMPLES["Weekly Pulse"];
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
