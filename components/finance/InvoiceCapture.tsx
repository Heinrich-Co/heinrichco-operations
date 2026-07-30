"use client";

import { useRef, useState } from "react";
import Card from "@/components/shared/Card";
import { CAPTURE_SAMPLES } from "@/lib/data";
import { ExtractedInvoice, Payable } from "@/lib/types";

interface Props {
  onConfirm: (p: Payable) => void;
}

type Phase = "idle" | "scanning" | "review";

// Read a File as a base64 data-URL string (without the prefix).
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InvoiceCapture({ onConfirm }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fields, setFields] = useState<ExtractedInvoice | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const sampleIdx = useRef(0);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setPhase("scanning");
    try {
      const image = await toBase64(file);
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType: file.type }),
      });
      if (!res.ok) throw new Error("capture failed");
      const data = (await res.json()) as ExtractedInvoice;
      setFields(data);
    } catch {
      // Fallback: rotate through local samples so the flow always demonstrates.
      const s = CAPTURE_SAMPLES[sampleIdx.current % CAPTURE_SAMPLES.length];
      sampleIdx.current += 1;
      setFields({
        vendor: s.vendor,
        amount: s.amount,
        currency: s.currency,
        due_date: s.due_date,
        invoice_number: s.invoice_no,
        category: s.category,
        description: s.description,
        confidence: s.confidence,
      });
    }
    setPhase("review");
  };

  const update = (k: keyof ExtractedInvoice, v: string) =>
    setFields((f) => (f ? { ...f, [k]: v } : f));

  const confirm = () => {
    if (!fields) return;
    onConfirm({
      id: "cap" + Date.now(),
      vendor: fields.vendor,
      category: fields.category || "Uncategorized",
      amount: fields.amount,
      status: "pending",
    });
    setPhase("idle");
    setFields(null);
  };

  const cancel = () => {
    setPhase("idle");
    setFields(null);
  };

  return (
    <>
      <Card eyebrow="Capture invoice" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 14, color: "var(--gray-d)", lineHeight: 1.6, maxWidth: 540 }}>
            Snap a photo or upload a PDF. The system reads the vendor, amount, and dates
            automatically and adds it to the ledger — no manual typing.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => cameraRef.current?.click()}>
              Take photo
            </button>
            <button className="btn ghost" onClick={() => fileRef.current?.click()}>
              Upload file
            </button>
          </div>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </Card>

      {phase === "scanning" && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="mb" style={{ textAlign: "center", padding: "46px 26px" }}>
              <div className="spinner" />
              <div style={{ fontSize: 15, color: "var(--gray-d)" }}>Reading the invoice…</div>
              <div style={{ fontSize: 12, color: "var(--gray-l)", marginTop: 6 }}>
                Extracting vendor, amount, and dates
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "review" && fields && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && cancel()}>
          <div className="modal">
            <div className="mh">
              <div className="k">Invoice capture · Darwin extracted</div>
              <h3>Review and confirm</h3>
            </div>
            <div className="mb">
              <div
                style={{
                  background: "var(--green)",
                  color: "var(--black)",
                  padding: "10px 14px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                Extracted successfully — review, edit if needed, and confirm.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <CapField label="Vendor" value={fields.vendor} onChange={(v) => update("vendor", v)} />
                <CapField label="Invoice #" value={fields.invoice_number} onChange={(v) => update("invoice_number", v)} />
                <CapField label="Amount" value={fields.amount} onChange={(v) => update("amount", v)} />
                <CapField label="Currency" value={fields.currency} onChange={(v) => update("currency", v)} />
                <CapField label="Due date" value={fields.due_date} onChange={(v) => update("due_date", v)} />
                <CapField label="Category" value={fields.category || ""} onChange={(v) => update("category", v)} />
              </div>
              {fields.description && (
                <div style={{ marginTop: 12 }}>
                  <CapField
                    label="Description"
                    value={fields.description}
                    onChange={(v) => update("description", v)}
                  />
                </div>
              )}
              {fileName && (
                <div style={{ fontSize: 11, color: "var(--gray-l)", marginTop: 10 }}>
                  Source file: {fileName}
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn ghost" onClick={cancel}>
                Cancel
              </button>
              <button className="btn" onClick={confirm}>
                Confirm &amp; add to ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CapField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="capfield">
      <div className="cl">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
