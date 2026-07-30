"use client";

import { useState } from "react";
import { useUI } from "@/components/AppProviders";
import Card from "@/components/shared/Card";
import BarChart from "@/components/shared/BarChart";
import LineChart from "@/components/shared/LineChart";
import DonutChart from "@/components/shared/DonutChart";
import Legend from "@/components/shared/Legend";
import { REPORTS } from "@/lib/data";
import { generateReport } from "@/lib/reports";

export default function ReportsPage() {
  const { toast } = useUI();
  const [reportId, setReportId] = useState<string | null>(null);

  if (reportId) {
    const r = generateReport(reportId);
    return (
      <>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <div className="eyebrow" style={{ margin: 0 }}>
                Generated report
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{r.title}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn"
                onClick={() => {
                  toast("Preparing PDF — use your browser's Save as PDF");
                  setTimeout(() => window.print(), 350);
                }}
              >
                Export to PDF
              </button>
              <button className="btn ghost" onClick={() => setReportId(null)}>
                Back to reports
              </button>
            </div>
          </div>

          <div className="rep-sum">
            {r.summary.map((s, i) => (
              <div className="item" key={i}>
                {s}
              </div>
            ))}
          </div>

          {r.chart && (
            <div style={{ marginBottom: 16 }}>
              {r.chart.type === "bar" && (
                <BarChart
                  data={r.chart.data}
                  highlightLast={r.chart.highlightLast}
                  showVals={r.chart.showVals}
                  height={180}
                />
              )}
              {r.chart.type === "line" && <LineChart data={r.chart.data} height={180} />}
              {r.chart.type === "donut" && (
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <DonutChart data={r.chart.data} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Legend data={r.chart.data} format={(v) => `€ ${v.toLocaleString()}`} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="scroll-x">
            <table className="hco">
              <thead>
                <tr>
                  {r.columns.map((c, i) => (
                    <th key={i} className={i ? "tr-num" : ""}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={ci ? "tr-num" : ""}
                        style={ci === 0 ? { fontWeight: 500, color: "var(--black)" } : undefined}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="note">
          Generated on demand from live ledger and pipeline data. Export produces a clean
          PDF via your browser&apos;s print dialog.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid-2">
        {REPORTS.map((r) => (
          <Card key={r.id}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: "var(--gray-d)", lineHeight: 1.55, marginBottom: 16 }}>
              {r.description}
            </div>
            <button className="btn" onClick={() => setReportId(r.id)}>
              Generate
            </button>
          </Card>
        ))}
      </div>
      <div className="note" style={{ marginTop: 14 }}>
        Every report is generated from the same data the dashboards use — one source of
        truth, no manual re-keying.
      </div>
    </>
  );
}
