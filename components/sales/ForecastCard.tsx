"use client";

import Card from "@/components/shared/Card";
import { DEALS } from "@/lib/data";
import { computeForecast } from "@/lib/forecast";

const money = (n: number) => "€ " + Math.round(n).toLocaleString();

// Weighted revenue forecast using stage probability × source multiplier.
export default function ForecastCard() {
  const f = computeForecast(DEALS);

  return (
    <Card eyebrow="Revenue forecast — weighted" style={{ marginBottom: 16 }}>
      <div className="row" style={{ marginBottom: 16 }}>
        {[
          { label: "Conservative", value: f.conservative },
          { label: "Expected", value: f.expected },
          { label: "Optimistic", value: f.optimistic },
        ].map((s) => (
          <div className="kpi" key={s.label} style={{ borderTopColor: "var(--green-dd)" }}>
            <div className="l">{s.label}</div>
            <div className="v">{money(s.value)}</div>
          </div>
        ))}
      </div>
      <div className="scroll-x">
        <table className="hco">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Stage</th>
              <th>Source</th>
              <th className="tr-num">Value</th>
              <th className="tr-num">Weighted</th>
              <th className="tr-num">Close</th>
            </tr>
          </thead>
          <tbody>
            {f.rows.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: "var(--black)" }}>
                  {r.name} · {r.company}
                </td>
                <td>{r.stage}</td>
                <td>{r.source}</td>
                <td className="tr-num">{money(r.value)}</td>
                <td className="tr-num" style={{ fontWeight: 600 }}>
                  {money(r.weighted)}
                </td>
                <td className="tr-num">{r.month}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note">
        Adjusted value = deal value × stage probability × source multiplier
        (Ambassador ×1.3, SEO-Noa ×1.2, Maverick ×1.0, Presto ×0.9). Model accuracy
        65–75%, improving with win/loss history.
      </div>
    </Card>
  );
}
