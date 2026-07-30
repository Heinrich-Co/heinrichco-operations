import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, DARWIN_MODEL } from "@/lib/darwin";
import { matchedSolution } from "@/lib/format";
import { FORBIDDEN_RULE } from "@/lib/brand";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

// Darwin drafts a commercial proposal outline for a lead. Uses Claude when
// ANTHROPIC_API_KEY is set; otherwise a structured brand template.
export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const name = String(body.name ?? "the client");
  const company = String(body.company ?? "the client");
  const sector = String(body.sector ?? "");
  const solution = matchedSolution(sector);

  let title = `Commercial proposal — ${company}`;
  let text =
    `COMMERCIAL PROPOSAL — ${company}\n\n` +
    `Prepared for: ${name}${sector ? ` · ${sector}` : ""}\n\n` +
    `1. Context\n` +
    `${company} is a Digital-stage organisation carrying the fragmentation trap: data across multiple tools, decisions lost between them.\n\n` +
    `2. Recommended solution\n` +
    `${solution} — a first step toward a single source of truth, with a path to a broader ecosymb integration.\n\n` +
    `3. Engagement\n` +
    `- Phase 1: AI-Native diagnosis (2 weeks)\n` +
    `- Phase 2: ${solution} implementation (6–8 weeks)\n` +
    `- Phase 3: enablement and knowledge transfer (ongoing)\n\n` +
    `4. Investment (outline)\n` +
    `- Diagnosis: fixed fee\n` +
    `- Implementation: milestone-based\n` +
    `- Enablement: monthly retainer\n\n` +
    `5. Next step\n` +
    `A 20-minute alignment call to confirm scope and timeline.`;

  const anthropic = getAnthropic();
  if (anthropic) {
    try {
      const msg = await anthropic.messages.create({
        model: DARWIN_MODEL,
        max_tokens: 900,
        system:
          "You are Darwin, drafting a concise commercial proposal for Heinrich Co. (AI-Native consulting). Corporate, direct, executive, no emojis. Premise, not promise — pricing stays an outline, never a guaranteed figure. Use clear numbered sections: Context, Recommended solution, Engagement phases, Investment outline, Next step. " +
          FORBIDDEN_RULE,
        messages: [
          {
            role: "user",
            content: `Draft a proposal for ${name} at ${company} (${sector}). Recommend ${solution}. Keep pricing as an outline, not exact figures.`,
          },
        ],
      });
      const first = msg.content.find((c) => c.type === "text");
      if (first && "text" in first && first.text.trim()) {
        text = first.text.trim();
        title = `Commercial proposal — ${company}`;
      }
    } catch {
      /* keep template */
    }
  }

  await logAudit({ action: "Drafted proposal", entity: "lead", details: { name, company } });
  return NextResponse.json({ title, body: text });
}
