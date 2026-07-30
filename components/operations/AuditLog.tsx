"use client";

import { useEffect, useState } from "react";
import Card from "@/components/shared/Card";

interface Entry {
  action: string;
  entity?: string;
  details?: string | Record<string, unknown> | null;
  actor?: string;
  created_at?: string;
}

// Owner-only audit trail: who did what, most recent first.
export default function AuditLog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((j) => setEntries(j.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const detailText = (d: Entry["details"]) =>
    !d ? "" : typeof d === "string" ? d : Object.values(d).filter(Boolean).join(" · ");

  return (
    <Card eyebrow="Recent activity — audit log" style={{ marginTop: 16 }}>
      {loading ? (
        <div className="note">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="note">No activity recorded yet.</div>
      ) : (
        entries.map((e, i) => (
          <div className="autorow" key={i}>
            <div>
              <div style={{ fontWeight: 500, color: "var(--black)" }}>{e.action}</div>
              <div style={{ fontSize: 12, color: "var(--gray-l)" }}>
                {[e.actor, detailText(e.details)].filter(Boolean).join(" — ")}
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-m)" }}>{e.created_at}</div>
          </div>
        ))
      )}
    </Card>
  );
}
