"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import { Payable } from "@/lib/types";

// Confidential payables Q&A, scoped to what's on screen. Mirrors the finance
// project's "Ask about payables" tool.
export default function AskFinance({ payables }: { payables: Payable[] }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const ask = async () => {
    if (!q.trim() || asking) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await fetch("/api/finance/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, payables }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No answer.");
    } catch {
      setAnswer("Could not reach the finance assistant.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <Card eyebrow="Ask about finances — confidential" style={{ marginTop: 16 }}>
      <div className="darwin-in">
        <input
          value={q}
          placeholder="e.g. How much is pending? Which vendor costs the most?"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          aria-label="Ask about finances"
        />
        <button className="btn green" onClick={ask} disabled={asking}>
          {asking ? "Thinking…" : "Ask"}
        </button>
      </div>
      {answer && (
        <div className="darwin-out" style={{ marginTop: 14 }}>
          {answer}
        </div>
      )}
      <div className="note">
        Answers from the payables on screen. Figures in EUR. Not a substitute for a
        licensed accountant.
      </div>
    </Card>
  );
}
