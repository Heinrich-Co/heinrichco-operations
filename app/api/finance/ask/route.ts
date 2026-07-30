import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, DARWIN_MODEL } from "@/lib/darwin";
import { parseAmt } from "@/lib/format";
import { Payable } from "@/lib/types";

export const runtime = "nodejs";

const FINANCE_SYSTEM = `You are the confidential finance assistant for Heinrich Co.
Answer concisely and executively, in plain prose, figures in EUR. You are NOT a licensed
accountant. Use ONLY the payables data provided in the message — never fabricate figures.
If the answer is not in the data, say so.`;

// Confidential payables Q&A. Uses Claude when configured; otherwise answers
// common questions deterministically from the provided payables data.
export async function POST(req: NextRequest) {
  let question = "";
  let payables: Payable[] = [];
  try {
    const body = await req.json();
    question = String(body.question ?? "");
    payables = Array.isArray(body.payables) ? body.payables : [];
  } catch {
    /* empty */
  }

  const anthropic = getAnthropic();

  if (!anthropic) {
    return NextResponse.json({ answer: localAnswer(question, payables) });
  }

  try {
    const compact = payables.map((p) => ({
      vendor: p.vendor,
      category: p.category,
      amount: p.amount,
      status: p.status,
      invoice_number: p.invoiceNumber,
      invoice_date: p.invoiceDate,
      due: p.due,
      description: p.description,
    }));
    const msg = await anthropic.messages.create({
      model: DARWIN_MODEL,
      max_tokens: 600,
      system: FINANCE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `PAYABLES (JSON):\n${JSON.stringify(compact)}\n\nQUESTION: ${question}`,
        },
      ],
    });
    const first = msg.content.find((c) => c.type === "text");
    return NextResponse.json({ answer: first && "text" in first ? first.text : "No answer." });
  } catch {
    return NextResponse.json({ answer: localAnswer(question, payables) });
  }
}

// Deterministic fallback so the panel is useful without an API key.
function localAnswer(question: string, payables: Payable[]): string {
  const q = question.toLowerCase();
  const sum = (list: Payable[]) => list.reduce((s, p) => s + parseAmt(p.amount), 0);
  const pending = payables.filter((p) => p.status === "pending");
  const overdue = payables.filter((p) => p.status === "overdue");
  const paid = payables.filter((p) => p.status === "paid");

  if (q.includes("overdue")) {
    return overdue.length
      ? `${overdue.length} overdue invoice(s), € ${sum(overdue).toLocaleString()} total.`
      : "Nothing is overdue right now.";
  }
  if (q.includes("pending") || q.includes("outstanding") || q.includes("owe")) {
    return `${pending.length} pending invoice(s), € ${sum(pending).toLocaleString()} outstanding.`;
  }
  if (q.includes("paid")) {
    return `${paid.length} invoice(s) marked paid, € ${sum(paid).toLocaleString()} total.`;
  }
  if (q.includes("most") || q.includes("largest") || q.includes("biggest") || q.includes("vendor") || q.includes("who")) {
    const top = [...payables].sort((a, b) => parseAmt(b.amount) - parseAmt(a.amount))[0];
    return top ? `Largest payable: ${top.vendor} — ${top.amount} (${top.category}, ${top.status}).` : "No payables loaded.";
  }
  if (q.includes("due") || q.includes("when")) {
    const withDue = payables.filter((p) => p.status !== "paid" && p.due);
    return withDue.length
      ? withDue.map((p) => `${p.vendor} — ${p.amount}, due ${p.due}${p.invoiceNumber ? ` (#${p.invoiceNumber})` : ""}.`).join(" ")
      : "No due dates on the outstanding payables.";
  }
  // Look up a specific vendor by name, returning its enriched detail.
  const named = payables.find((p) => p.vendor && q.includes(p.vendor.toLowerCase().split(" ")[0]));
  if (named) {
    const bits = [
      `${named.vendor} — ${named.amount} (${named.status})`,
      named.invoiceNumber ? `invoice #${named.invoiceNumber}` : "",
      named.due ? `due ${named.due}` : "",
      named.description ? `— ${named.description}` : "",
    ].filter(Boolean);
    return bits.join(", ").replace(", —", " —") + ".";
  }
  if (q.includes("total") || q.includes("how much")) {
    return `Across ${payables.length} invoices: € ${sum(payables).toLocaleString()} total · € ${sum(pending).toLocaleString()} pending · € ${sum(overdue).toLocaleString()} overdue.`;
  }
  return `Summary — ${payables.length} invoices: € ${sum(pending).toLocaleString()} pending, ${overdue.length} overdue. (Connect ANTHROPIC_API_KEY for detailed answers.)`;
}
