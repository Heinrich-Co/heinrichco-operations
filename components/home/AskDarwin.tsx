"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/shared/Card";

// Compact "Ask Darwin" launcher on the Command Center. Routes to the Darwin
// page with the query pre-filled (?q=), where it auto-runs — one tap from the
// home screen to a briefing.
export default function AskDarwin() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const go = (query: string) => {
    const text = query.trim();
    router.push(`/darwin${text ? `?q=${encodeURIComponent(text)}` : ""}`);
  };

  const quick = ["Weekly Pulse", "Prep Meeting", "Campaign Analysis"];

  return (
    <Card eyebrow="Ask Darwin" style={{ marginTop: 16 }}>
      <div className="darwin-in">
        <input
          value={q}
          placeholder="Ask Darwin anything — e.g. give me the weekly pulse"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go(q || "Weekly Pulse")}
          aria-label="Ask Darwin"
        />
        <button className="btn green" onClick={() => go(q || "Weekly Pulse")}>
          Ask
        </button>
      </div>
      <div className="cmds">
        {quick.map((c) => (
          <button key={c} onClick={() => go(c)}>
            {c}
          </button>
        ))}
      </div>
    </Card>
  );
}
