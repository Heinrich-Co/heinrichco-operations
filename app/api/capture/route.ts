import { NextRequest, NextResponse } from "next/server";
import { DARWIN_MODEL, getAnthropic } from "@/lib/darwin";
import { CAPTURE_SAMPLES } from "@/lib/data";
import { ExtractedInvoice } from "@/lib/types";

export const runtime = "nodejs";

const EXTRACT_PROMPT =
  "Extract from this invoice: vendor name, amount, currency, due date, invoice number, and a best-guess expense category. " +
  'Return JSON only, no prose: {"vendor": string, "amount": string, "currency": string, "due_date": string, "invoice_number": string, "category": string}';

// Accepts a base64 image and returns structured invoice fields via Claude Vision.
// Falls back to a sample when ANTHROPIC_API_KEY is not configured.
export async function POST(req: NextRequest) {
  let image = "";
  let mimeType = "image/jpeg";
  try {
    const body = await req.json();
    image = body.image || "";
    mimeType = body.mimeType || mimeType;
  } catch {
    /* ignore */
  }

  const anthropic = getAnthropic();

  // Demo mode / PDF (Vision expects images): rotate through sample extractions.
  if (!anthropic || !image || !mimeType.startsWith("image/")) {
    const s = CAPTURE_SAMPLES[Math.floor(Date.now() / 1000) % CAPTURE_SAMPLES.length];
    const sample: ExtractedInvoice = {
      vendor: s.vendor,
      amount: s.amount,
      currency: s.currency,
      due_date: s.due_date,
      invoice_number: s.invoice_no,
      category: s.category,
      description: s.description,
      confidence: s.confidence,
    };
    return NextResponse.json(sample);
  }

  try {
    const msg = await anthropic.messages.create({
      model: DARWIN_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: image,
              },
            },
            { type: "text", text: EXTRACT_PROMPT },
          ],
        },
      ],
    });

    const text = msg.content.find((c) => c.type === "text");
    const raw = text && "text" in text ? text.text : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as ExtractedInvoice;
    return NextResponse.json({ confidence: "High", ...parsed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "extraction failed" },
      { status: 502 }
    );
  }
}
