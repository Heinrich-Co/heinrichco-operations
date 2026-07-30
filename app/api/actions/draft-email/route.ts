import { NextRequest, NextResponse } from "next/server";
import { getDelegatedAuth, toRawMessage, google } from "@/lib/actions-google";
import { getAnthropic, DARWIN_MODEL } from "@/lib/darwin";
import { matchedSolution } from "@/lib/format";
import { FORBIDDEN_RULE } from "@/lib/brand";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

// Drafts a follow-up outreach email for a lead. Darwin (Claude) writes it when
// ANTHROPIC_API_KEY is set; otherwise a brand template. Creates a real Gmail
// draft when Google delegation is configured, else returns compose-only.
export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const name = String(body.name ?? "there");
  const company = String(body.company ?? "your company");
  const sector = String(body.sector ?? "");
  const to = String(body.to ?? "");
  const solution = matchedSolution(sector);

  let subject = `Following up — ${company}`;
  let text =
    `Hi ${name.split(" ")[0]},\n\n` +
    `Great connecting. Most scaling ${sector ? sector.toLowerCase() + " " : ""}teams don't have a technology problem — they have an integration problem: data in six places, decisions lost between them.\n\n` +
    `Based on what you shared, ${solution} looks like the right first step toward a single source of truth. Worth a 20-minute diagnosis to map where fragmented data is costing you decision time?\n\n` +
    `Best,\nHeinrich Co.`;

  // Let Darwin write it when available.
  const anthropic = getAnthropic();
  if (anthropic) {
    try {
      const msg = await anthropic.messages.create({
        model: DARWIN_MODEL,
        max_tokens: 400,
        system:
          "You are Darwin, writing a concise, executive B2B follow-up email for Heinrich Co. (AI-Native consulting). Corporate, direct, no emojis. Premise, not promise — never guarantee outcomes. Return the email body only. " +
          FORBIDDEN_RULE,
        messages: [
          {
            role: "user",
            content: `Write a short follow-up to ${name} at ${company} (${sector}). Recommend ${solution}. Offer a 20-minute diagnosis.`,
          },
        ],
      });
      const first = msg.content.find((c) => c.type === "text");
      if (first && "text" in first && first.text.trim()) text = first.text.trim();
    } catch {
      /* keep template */
    }
  }

  // Create a real Gmail draft when delegation is configured.
  const auth = getDelegatedAuth(["https://www.googleapis.com/auth/gmail.compose"]);
  let created = false;
  if (auth) {
    try {
      const gmail = google.gmail({ version: "v1", auth });
      await gmail.users.drafts.create({
        userId: "me",
        requestBody: { message: { raw: toRawMessage(to, subject, text) } },
      });
      created = true;
      await logAudit({ action: "Drafted follow-up email", entity: "lead", details: { name, company } });
    } catch {
      created = false;
    }
  }

  return NextResponse.json({ subject, body: text, created, configured: Boolean(auth) });
}
