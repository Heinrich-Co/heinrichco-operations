"use client";

import { useUI } from "@/components/AppProviders";
import { useActions } from "@/components/useActions";
import Kpi from "@/components/shared/Kpi";
import Card from "@/components/shared/Card";
import BarChart from "@/components/shared/BarChart";
import LineChart from "@/components/shared/LineChart";
import DataTable, { Column } from "@/components/shared/DataTable";
import ForecastCard from "@/components/sales/ForecastCard";
import { BOOKINGS, FORECAST, LEADS, PIPELINE_STAGES, SALES_KPIS } from "@/lib/data";
import { C } from "@/lib/palette";
import { Lead } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export default function SalesPage() {
  const { openLead } = useUI();
  const { prepBrief } = useActions();
  // Reads through the data layer; live-updates when Supabase is connected.
  const { data: leads } = useLiveResource<Lead>("leads", LEADS);

  const columns: Column<Lead>[] = [
    { key: "name", label: "Name", primary: true },
    { key: "company", label: "Company" },
    { key: "sector", label: "Sector" },
    { key: "stage", label: "Stage" },
    {
      key: "score",
      label: "Score",
      numeric: true,
      render: (l) => (
        <span style={{ fontWeight: 600, color: l.hot ? C.greenDD : C.grayD }}>
          {l.score}
        </span>
      ),
    },
    { key: "source", label: "Source" },
    {
      key: "action",
      label: "",
      numeric: true,
      render: (l) =>
        l.hot ? (
          <button
            className="btn sm"
            onClick={(e) => {
              e.stopPropagation();
              prepBrief(`lead:${l.name}`);
            }}
          >
            Prep Meeting
          </button>
        ) : (
          <span style={{ color: "var(--gray-l)", fontSize: 12 }}>—</span>
        ),
    },
  ];

  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        {SALES_KPIS.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} />
        ))}
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <Card eyebrow="Pipeline by stage" style={{ flex: "1 1 300px" }}>
          <BarChart data={PIPELINE_STAGES} showVals height={190} />
        </Card>
        <Card eyebrow="Weighted forecast (€K)" style={{ flex: "1 1 300px" }}>
          <LineChart data={FORECAST} height={190} />
        </Card>
      </div>

      <ForecastCard />

      <Card eyebrow="Lead pipeline" style={{ marginBottom: 16 }}>
        <DataTable
          columns={columns}
          rows={leads}
          rowKey={(l) => l.id}
          onRowClick={(l) => openLead(l.id)}
        />
      </Card>

      <Card eyebrow="Booking feed — new from website">
        {BOOKINGS.map((b, i) => (
          <div className="action" key={i}>
            <div className="txt">
              <div className="t">{b.name}</div>
              <div className="d">{b.service}</div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--gray-m)" }}>{b.when}</div>
          </div>
        ))}
      </Card>
    </>
  );
}
