import { Deal } from "./types";

/*
 * Revenue forecast model — Project Darwin's exact weighting.
 * Adjusted Value = value × stage probability × source multiplier.
 */
export const STAGE_PROB: Record<string, number> = {
  New: 0.05,
  Contacted: 0.10,
  Responded: 0.15,
  Discovery: 0.25,
  Proposal: 0.40,
  Negotiation: 0.65,
};

// Ambassador ×1.3 · SEO-Noa ×1.2 · Maverick ×1.0 · Presto ×0.9 · other ×1.0.
export const SRC_MULT: Record<string, number> = {
  Ambassador: 1.3,
  "SEO-Noa": 1.2,
  Maverick: 1.0,
  Presto: 0.9,
};

export function weightedValue(d: Deal): number {
  return d.value * (STAGE_PROB[d.stage] ?? 0) * (SRC_MULT[d.source] ?? 1);
}

export interface ForecastRow extends Deal {
  weighted: number;
}

export interface Forecast {
  conservative: number;
  expected: number;
  optimistic: number;
  rows: ForecastRow[];
}

// Conservative ×0.7 · Expected ×1.0 · Optimistic ×1.3. 65–75% accuracy.
export function computeForecast(deals: Deal[]): Forecast {
  const rows = deals
    .map((d) => ({ ...d, weighted: weightedValue(d) }))
    .sort((a, b) => b.weighted - a.weighted);
  const expected = rows.reduce((s, r) => s + r.weighted, 0);
  return {
    conservative: Math.round(expected * 0.7),
    expected: Math.round(expected),
    optimistic: Math.round(expected * 1.3),
    rows,
  };
}
