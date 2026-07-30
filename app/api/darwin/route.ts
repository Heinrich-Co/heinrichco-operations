import { NextRequest } from "next/server";
import {
  DARWIN_MODEL,
  DARWIN_SYSTEM_PROMPT,
  buildContext,
  getAnthropic,
} from "@/lib/darwin";
import { DARWIN_SAMPLES } from "@/lib/data";
import { matchDarwin } from "@/lib/format";
import { buildDataSummary } from "@/lib/summary";

export const runtime = "nodejs";

// Streams a plain-text response so the client can render it with a typewriter
// effect. Uses the Claude API when configured, otherwise streams the closest
// canned sample word-by-word.
export async function POST(req: NextRequest) {
  let command = "Weekly Pulse";
  let roleName = "operator";
  try {
    const body = await req.json();
    command = (body.command || command).toString();
    roleName = (body.roleName || roleName).toString();
  } catch {
    /* use defaults */
  }

  const anthropic = getAnthropic();
  const encoder = new TextEncoder();

  if (!anthropic) {
    // Demo mode — stream a canned sample so Darwin is always demonstrable.
    const text = DARWIN_SAMPLES[matchDarwin(command)] || DARWIN_SAMPLES["Weekly Pulse"];
    const stream = new ReadableStream({
      async start(controller) {
        const words = text.split(/(\s+)/);
        for (const w of words) {
          controller.enqueue(encoder.encode(w));
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const summary = await buildDataSummary();
  const userMessage = buildContext(
    `${summary}\n\n(Requesting role: ${roleName})`,
    command
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: DARWIN_MODEL,
          max_tokens: 1024,
          system: DARWIN_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });
        claudeStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });
        await claudeStream.finalMessage();
        controller.close();
      } catch (err) {
        const msg =
          "Darwin could not reach the model. " +
          (err instanceof Error ? err.message : "Unknown error.");
        controller.enqueue(encoder.encode(msg));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
