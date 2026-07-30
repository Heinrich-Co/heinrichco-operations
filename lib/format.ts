// Parse a currency-ish string ("€ 2,784") into a number.
export function parseAmt(s: string): number {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ""));
  return isFinite(n) ? n : 0;
}

// Long, localized date for the Command Center hero.
export function longDate(d: Date = new Date()): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Time-of-day greeting for the hero.
export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Match a free-text Darwin query to the closest canned command key.
export function matchDarwin(q: string): string {
  const s = (q || "").toLowerCase();
  if (!s) return "Weekly Pulse";
  if (s.includes("executive") || s.includes("summary") || s.includes("overview"))
    return "Executive Summary";
  if (s.includes("pulse") || s.includes("weekly")) return "Weekly Pulse";
  if (s.includes("enrich")) return "Enrich Lead";
  if (s.includes("prep") || s.includes("meeting")) return "Prep Meeting";
  if (s.includes("campaign") || s.includes("analyz") || s.includes("analyse"))
    return "Campaign Analysis";
  if (s.includes("gap")) return "Content Gap";
  if (s.includes("outreach") || s.includes("email")) return "Generate Outreach";
  if (s.includes("seo") || s.includes("audit")) return "SEO Audit";
  if (s.includes("lead")) return "Enrich Lead";
  return "Weekly Pulse";
}

// Matched Heinrich Co. solution per sector (used in the lead drawer).
export function matchedSolution(sector: string): string {
  const map: Record<string, string> = {
    Healthcare: "ecosymb.[care]",
    Manufacturing: "symb.[aura]",
    "Supply Chain": "symb.[aura]",
    Retail: "symb.[momentum]",
    "People & Dev": "symb.[coach]",
  };
  return map[sector] || "symb.[aura]";
}
