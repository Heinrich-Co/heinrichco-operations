import { FIN_CATS, FIN_MONTHLY, FORECAST, SEO } from "./data";
import { ChartDatum } from "./types";

export interface GeneratedReport {
  title: string;
  summary: string[];
  columns: string[];
  rows: string[][];
  chart?: { type: "bar" | "line" | "donut"; data: ChartDatum[]; highlightLast?: boolean; showVals?: boolean };
}

// Report generator — derives every report from the same data the dashboards use
// (one source of truth, no manual re-keying), mirroring the prototype.
export function generateReport(id: string): GeneratedReport {
  const m = FIN_MONTHLY;
  const cats = FIN_CATS;
  const fc = FORECAST;
  const spend = m.reduce((a, b) => a + b.value, 0);
  const burn = Math.round(spend / m.length);
  const cash = 78200;

  if (id === "cashflow") {
    return {
      title: "Cash flow summary",
      summary: [
        "Cash position: € 78,200",
        `Tracked outgoings: € ${spend.toLocaleString()}`,
        `Avg. monthly: € ${burn.toLocaleString()}`,
      ],
      chart: { type: "bar", data: m, highlightLast: true },
      columns: ["Month", "Outgoings (€)"],
      rows: m.map((x) => [x.label, `€ ${x.value.toLocaleString()}`]),
    };
  }
  if (id === "runway") {
    const months = (cash / burn).toFixed(1);
    return {
      title: "Burn & runway",
      summary: [
        "Cash position: € 78,200",
        `Average monthly burn: € ${burn.toLocaleString()}`,
        `Estimated runway: ${months} months`,
      ],
      chart: { type: "line", data: m },
      columns: ["Month", "Spend (€)"],
      rows: m.map((x) => [x.label, `€ ${x.value.toLocaleString()}`]),
    };
  }
  if (id === "pnl") {
    const income = 42600;
    const exp = cats.reduce((a, b) => a + b.value, 0);
    const net = income - exp;
    const margin = ((net / income) * 100).toFixed(1);
    return {
      title: "Profit & loss (simplified)",
      summary: [
        `Income (FY): € ${income.toLocaleString()}`,
        `Expenses (FY): € ${exp.toLocaleString()}`,
        `Net: € ${net.toLocaleString()}`,
        `Margin: ${margin}%`,
      ],
      columns: ["Line", "Amount (€)"],
      rows: [
        ["Income", `€ ${income.toLocaleString()}`],
        ...cats.map((c) => [c.label, `(€ ${c.value.toLocaleString()})`]),
        ["Net", `€ ${net.toLocaleString()}`],
      ],
    };
  }
  if (id === "expense") {
    const total = cats.reduce((a, b) => a + b.value, 0);
    return {
      title: "Expense breakdown",
      summary: [
        `Total expenses: € ${total.toLocaleString()}`,
        `Categories: ${cats.length}`,
        `Largest: ${cats[0].label}`,
      ],
      chart: { type: "donut", data: cats },
      columns: ["Category", "Amount (€)", "Share"],
      rows: cats.map((c) => [
        c.label,
        `€ ${c.value.toLocaleString()}`,
        `${((c.value / total) * 100).toFixed(1)}%`,
      ]),
    };
  }
  if (id === "forecast") {
    const w = fc.reduce((a, b) => a + b.value, 0);
    return {
      title: "Pipeline forecast",
      summary: ["Weighted pipeline: € 182.4K", `6-month outlook: € ${w}K`, "Active leads: 25"],
      chart: { type: "bar", data: fc, showVals: true },
      columns: ["Month", "Weighted (€K)"],
      rows: fc.map((x) => [x.label, `€ ${x.value}K`]),
    };
  }
  // content
  return {
    title: "Content performance",
    summary: [
      "Published this month: 10",
      "In review: 2",
      "Best position: 1.9 (symbiosis AI framework)",
    ],
    columns: ["Keyword", "Position", "CTR", "Impressions"],
    rows: SEO.map((s) => [s.keyword, s.position, s.ctr, s.impressions]),
  };
}
