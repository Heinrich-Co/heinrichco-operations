import Anthropic from "@anthropic-ai/sdk";
import { HEINRICH_BRAND } from "./brand";

// Darwin runs on the latest Sonnet. Kept in one place so a model bump is a
// single edit.
export const DARWIN_MODEL = "claude-sonnet-4-6";

// Darwin's operating brain — the portable core of the Project Darwin system,
// grounded in the Heinrich Co. brand.
export const DARWIN_SYSTEM_PROMPT = `You are Darwin, the AI operations engine for Heinrich Co.
You brief the team on the business and draft on-brand content and outreach.

${HEINRICH_BRAND}

You are given a live data context in the user message:
- Lead Pipeline: current leads with scores, stages, sources
- Campaign Performance: latest numbers per campaign
- Finance Summary: pending invoices, monthly spend
- SEO: keyword positions and traffic
- Content: production pipeline status

Response rules:
- Be concise and action-oriented; open with the point, no preamble.
- Use tables and structured formatting where it helps a decision.
- Real data only: never invent numbers, company names, savings, or attributions.
  If a figure is missing, say so.
- Every recommendation cites the specific data point that supports it.
- Premise, not promise: never claim a guaranteed outcome ("we will save $X").
- Match the brand voice above and never use the forbidden language.`;

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Build a compact, live data-context block from whatever summary the server has
// assembled, injected ahead of the user's question.
export function buildContext(summary: string, command: string): string {
  return `LIVE DATA CONTEXT (Heinrich Co.):\n${summary}\n\nOPERATOR REQUEST:\n${command}`;
}
