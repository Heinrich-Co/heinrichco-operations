"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/components/AppProviders";
import { useLiveResource } from "@/lib/use-live-resource";
import { canSeeFinance } from "@/lib/roles";
import Card from "@/components/shared/Card";
import Kpi from "@/components/shared/Kpi";
import Chip from "@/components/shared/Chip";
import DonutChart from "@/components/shared/DonutChart";
import BarChart from "@/components/shared/BarChart";
import Legend from "@/components/shared/Legend";
import InvoiceCapture from "@/components/finance/InvoiceCapture";
import AskFinance from "@/components/finance/AskFinance";
import { FIN_CATS, FIN_MONTHLY, PAYABLES, RECURRING } from "@/lib/data";
import { parseAmt } from "@/lib/format";
import { Payable } from "@/lib/types";

export default function FinancePage() {
  const { user, toast } = useUI();
  // Real payables: live from the `invoices` table when Supabase is configured,
  // seeded with sample data otherwise. Local state carries optimistic edits
  // (mark-paid, captured invoice) on top of the fetched data.
  const { data: livePayables } = useLiveResource<Payable>("invoices", PAYABLES);
  const [payables, setPayables] = useState<Payable[]>(PAYABLES);
  const [recurringOpen, setRecurringOpen] = useState(true);

  useEffect(() => {
    setPayables(livePayables);
  }, [livePayables]);

  const pending = useMemo(() => payables.filter((p) => p.status === "pending"), [payables]);
  const overdue = useMemo(() => payables.filter((p) => p.status === "overdue"), [payables]);
  const pendTotal = pending.reduce((s, p) => s + parseAmt(p.amount), 0);

  // Role enforcement — the tab is hidden in the sidebar, this is defense in depth.
  if (!canSeeFinance(user)) {
    return (
      <Card eyebrow="Finance">
        <div style={{ fontSize: 15, color: "var(--gray-d)", lineHeight: 1.6 }}>
          Finance is restricted to owners. You are viewing as{" "}
          <strong>{user.name}</strong> ({user.title}). Switch to an owner account to
          view payables and spend.
        </div>
      </Card>
    );
  }

  const markPaid = (id: string) => {
    setPayables((ps) => ps.map((p) => (p.id === id ? { ...p, status: "paid" } : p)));
    toast("Marked as paid — ledger updated");
  };

  const addInvoice = (p: Payable) => {
    setPayables((ps) => [p, ...ps]);
    toast("Invoice captured — added to the ledger as pending");
  };

  const kpis = [
    { label: "Pending", value: String(pending.length), sub: `€ ${pendTotal.toLocaleString()} total` },
    { label: "Overdue", value: String(overdue.length), sub: overdue.length ? "Action needed" : "Nothing past due" },
    { label: "Paid this month", value: "€ 3,924", sub: "July" },
    { label: "Cash position", value: "€ 78,200", sub: "Across accounts" },
  ];

  const needsPayment = payables.filter((p) => p.status !== "paid");

  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        {kpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} />
        ))}
      </div>

      <InvoiceCapture onConfirm={addInvoice} />

      <Card eyebrow="Needs payment" style={{ marginBottom: 16 }}>
        {needsPayment.length === 0 ? (
          <div className="note">Nothing to pay right now — you&apos;re all caught up.</div>
        ) : (
          needsPayment.map((p) => (
            <div
              className="action"
              key={p.id}
              style={{
                borderLeft:
                  p.status === "overdue"
                    ? "3px solid var(--brick)"
                    : "3px solid var(--amber)",
                paddingLeft: 12,
              }}
            >
              <div className="action-left">
                <div className="txt">
                  <div className="t">
                    {p.vendor} — {p.amount}
                  </div>
                  <div className="d">
                    {p.category} · <Chip variant={p.status as "pending" | "overdue"}>{p.status}</Chip>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn sm" onClick={() => markPaid(p.id)}>
                  Mark Paid
                </button>
                <button
                  className="btn sm ghost"
                  onClick={() => toast(`Opening invoice — ${p.vendor}`)}
                >
                  View Invoice
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Card eyebrow="All payables" style={{ marginBottom: 16 }}>
        <div className="scroll-x">
          <table className="hco">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th className="tr-num">Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payables.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, color: "var(--black)" }}>{p.vendor}</td>
                  <td>{p.category}</td>
                  <td className="tr-num" style={{ fontWeight: 600 }}>
                    {p.amount}
                  </td>
                  <td>
                    <Chip variant={p.status}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Chip>
                  </td>
                  <td className="tr-num">
                    {p.status === "paid" ? (
                      <span style={{ color: "var(--gray-l)", fontSize: 12 }}>—</span>
                    ) : (
                      <button className="btn sm" onClick={() => markPaid(p.id)}>
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="row" style={{ marginBottom: 16 }}>
        <Card eyebrow="Spend by category" style={{ flex: "1 1 300px" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <DonutChart data={FIN_CATS} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <Legend data={FIN_CATS} format={(v) => `€ ${v.toLocaleString()}`} />
            </div>
          </div>
        </Card>
        <Card eyebrow="Monthly spend (€)" style={{ flex: "1 1 300px" }}>
          <BarChart data={FIN_MONTHLY} highlightLast height={190} />
        </Card>
      </div>

      <Card>
        <div
          className="eyebrow"
          style={{ marginBottom: 0, cursor: "pointer", display: "flex", justifyContent: "space-between" }}
          onClick={() => setRecurringOpen((o) => !o)}
        >
          <span>Recurring subscriptions</span>
          <span>{recurringOpen ? "−" : "+"}</span>
        </div>
        {recurringOpen && (
          <div style={{ marginTop: 14 }}>
            {RECURRING.map((x, i) => (
              <div className="autorow" key={i}>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--black)" }}>{x.vendor}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-l)" }}>
                    Next billing · {x.next}
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>{x.amount}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AskFinance payables={payables} />
    </>
  );
}
