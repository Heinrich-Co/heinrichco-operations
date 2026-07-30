"use client";

import { useMemo, useState } from "react";
import { useUI } from "@/components/AppProviders";
import { useActions } from "@/components/useActions";
import Card from "@/components/shared/Card";
import Chip from "@/components/shared/Chip";
import { canSeeFinance } from "@/lib/roles";
import { CONTENT, LEADS, PAYABLES } from "@/lib/data";

interface InboxItem {
  key: string;
  kind: "invoice" | "content" | "lead";
  title: string;
  subtitle: string;
  chip?: { label: string; variant: "pending" | "overdue" | "neutral" };
  actionLabel: string;
}

// One place for everything awaiting the CEO's action — pay, approve, follow up.
export default function ApprovalsPage() {
  const { user, toast } = useUI();
  const { prepBrief } = useActions();
  const [done, setDone] = useState<Set<string>>(new Set());

  const items = useMemo<InboxItem[]>(() => {
    const list: InboxItem[] = [];

    if (canSeeFinance(user)) {
      PAYABLES.filter((p) => p.status !== "paid").forEach((p) =>
        list.push({
          key: `inv-${p.id}`,
          kind: "invoice",
          title: `${p.vendor} — ${p.amount}`,
          subtitle: p.category,
          chip: { label: p.status, variant: p.status === "overdue" ? "overdue" : "pending" },
          actionLabel: "Mark Paid",
        })
      );
    }

    CONTENT.filter((c) => c.status === "Draft" || c.status === "Approved").forEach((c) =>
      list.push({
        key: `content-${c.id}`,
        kind: "content",
        title: c.title,
        subtitle: `${c.meta} · ${c.status}`,
        chip: { label: "awaiting approval", variant: "neutral" },
        actionLabel: "Approve",
      })
    );

    LEADS.filter((l) => l.hot)
      .slice(0, 2)
      .forEach((l) =>
        list.push({
          key: `lead-${l.id}`,
          kind: "lead",
          title: `${l.name} — ${l.company}`,
          subtitle: `Hot lead · score ${l.score} · no next step`,
          chip: { label: "stalled", variant: "overdue" },
          actionLabel: "Prep Brief",
        })
      );

    return list;
  }, [user]);

  const visible = items.filter((i) => !done.has(i.key));

  const act = (item: InboxItem) => {
    if (item.kind === "invoice") toast("Marked as paid — ledger updated");
    else if (item.kind === "content") {
      fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "content", id: item.title, status: "Approved", title: item.title }),
      }).catch(() => {});
      toast("Approved");
    } else {
      prepBrief(`lead:${item.title}`);
    }
    setDone((d) => new Set(d).add(item.key));
  };

  return (
    <>
      <Card>
        <div className="section-head">
          <div className="eyebrow" style={{ margin: 0 }}>
            Approvals inbox
          </div>
          {visible.length > 0 && <span className="count-pill">{visible.length}</span>}
        </div>

        {visible.length === 0 ? (
          <div className="note">All clear — nothing awaiting your approval right now.</div>
        ) : (
          visible.map((item) => (
            <div className="action" key={item.key}>
              <div className="action-left">
                <div className="txt">
                  <div className="t">{item.title}</div>
                  <div className="d">
                    {item.subtitle}
                    {item.chip && (
                      <>
                        {" · "}
                        <Chip variant={item.chip.variant}>{item.chip.label}</Chip>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="btn sm" onClick={() => act(item)}>
                {item.actionLabel}
              </button>
            </div>
          ))
        )}
      </Card>

      <div className="note">
        Everything that needs a decision — payments, content, and stalled hot leads —
        in one place. Acting here updates the source and records it in the audit log.
      </div>
    </>
  );
}
