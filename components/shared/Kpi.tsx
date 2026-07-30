import { KpiTrend } from "@/lib/types";

interface Props {
  label: string;
  value: string;
  sub: string | string[];
  trend?: KpiTrend;
}

const ARROW: Record<KpiTrend["dir"], string> = {
  up: "▲",
  down: "▼",
  flat: "→",
};

// KPI card with 3px green-d top border and an optional week-over-week trend.
export default function Kpi({ label, value, sub, trend }: Props) {
  const lines = Array.isArray(sub) ? sub : [sub];
  return (
    <div className="kpi">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      <div className="s">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
      {trend && (
        <div className={`kpi-trend ${trend.tone}`}>
          <span className="kpi-arrow">{ARROW[trend.dir]}</span>
          {trend.label}
        </div>
      )}
    </div>
  );
}
