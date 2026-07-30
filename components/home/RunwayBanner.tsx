"use client";

import { FIN_MONTHLY } from "@/lib/data";

// At-a-glance financial early warning for the CEO. Green = healthy,
// amber = watch, brick = act. Only rendered for finance-authorized users.
const CASH = 78200;
const BURN = Math.round(FIN_MONTHLY.reduce((a, b) => a + b.value, 0) / FIN_MONTHLY.length);
const MONTHS = CASH / BURN;

export default function RunwayBanner() {
  const tone = MONTHS < 6 ? "bad" : MONTHS < 9 ? "warn" : "good";
  const color =
    tone === "bad" ? "var(--brick)" : tone === "warn" ? "var(--amber)" : "var(--green-dd)";
  const message =
    tone === "bad"
      ? "Runway is short — review spend and pipeline."
      : tone === "warn"
        ? "Runway is healthy but worth watching."
        : "Runway is healthy.";

  return (
    <div className="runway" style={{ borderLeftColor: color }}>
      <div>
        <span className="runway-dot" style={{ background: color }} />
        <span className="runway-v">{MONTHS.toFixed(1)} months runway</span>
        <span className="runway-s">{message}</span>
      </div>
      <div className="runway-meta">
        € {CASH.toLocaleString()} cash · € {BURN.toLocaleString()}/mo burn
      </div>
    </div>
  );
}
