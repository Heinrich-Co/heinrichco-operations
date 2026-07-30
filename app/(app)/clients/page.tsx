"use client";

import Card from "@/components/shared/Card";
import Kpi from "@/components/shared/Kpi";
import Chip from "@/components/shared/Chip";
import { ENGAGEMENTS, ENGAGEMENT_PHASES } from "@/lib/data";
import { useLiveResource } from "@/lib/use-live-resource";
import { Engagement } from "@/lib/types";

const money = (n: number) => "€ " + n.toLocaleString();

function ktVariant(kt: string): "paid" | "pending" | "neutral" {
  return kt === "Complete" ? "paid" : kt === "In progress" ? "pending" : "neutral";
}

export default function ClientsPage() {
  // Post-sale delivery view; live when Supabase's client_engagements table fills.
  const { data: engagements } = useLiveResource<Engagement>("clients", ENGAGEMENTS);

  const active = engagements.filter((e) => e.phase !== "Complete");
  const totalValue = engagements.reduce((s, e) => s + e.value, 0);
  const inKT = engagements.filter((e) => e.kt === "In progress").length;
  const optimizing = engagements.filter((e) => e.phase === "Optimization").length;

  const kpis = [
    { label: "Active engagements", value: String(active.length), sub: `${engagements.length} total` },
    { label: "Contract value", value: money(totalValue), sub: "Across engagements" },
    { label: "In knowledge transfer", value: String(inKT), sub: "The differentiator" },
    { label: "Wrapping up", value: String(optimizing), sub: "Optimization phase" },
  ];

  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        {kpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} />
        ))}
      </div>

      <Card eyebrow="Active client engagements">
        <div className="grid-2">
          {engagements.map((e) => {
            const idx = ENGAGEMENT_PHASES.indexOf(e.phase);
            const phaseIdx = e.phase === "Complete" ? ENGAGEMENT_PHASES.length : idx;
            return (
              <div className="eng-card" key={e.id}>
                <div className="eng-head">
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--black)" }}>
                      {e.company}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--gray-l)", marginTop: 2 }}>
                      {e.contact} · {e.sector}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, color: "var(--black)" }}>{money(e.value)}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-m)" }}>{e.service}</div>
                  </div>
                </div>

                <div className="phase-steps">
                  {ENGAGEMENT_PHASES.map((p, i) => (
                    <div
                      key={p}
                      className={`phase-seg ${i < phaseIdx ? "done" : i === phaseIdx ? "current" : ""}`}
                    />
                  ))}
                </div>
                <div className="phase-labels">
                  <span>{e.phase}</span>
                  <span>
                    {e.phase === "Complete"
                      ? "Delivered"
                      : `Phase ${idx + 1} of ${ENGAGEMENT_PHASES.length}`}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: "var(--gray-d)" }}>
                    Next: {e.nextMilestone} · Owner {e.owner}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-m)" }}>
                    Knowledge transfer: <Chip variant={ktVariant(e.kt)}>{e.kt}</Chip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="note">
        Every engagement carries knowledge transfer explicitly — the Heinrich Co.
        differentiator. Phases follow Discovery → Strategy → Validation →
        Implementation → Optimization.
      </div>
    </>
  );
}
