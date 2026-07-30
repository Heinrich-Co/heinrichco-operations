import { createAdminClient } from "./supabase-server";
import {
  FIN_MONTHLY,
  LEADS,
  PAYABLES,
  PIPELINE_STAGES,
  SEO,
} from "./data";
import { parseAmt } from "./format";

/*
 * Assembles a compact, live data-context block for Darwin. Reads from Supabase
 * when configured, otherwise summarizes the seed data — so Darwin always has
 * grounded context to cite.
 */
export async function buildDataSummary(): Promise<string> {
  const admin = createAdminClient();

  if (admin) {
    try {
      const [{ data: leads }, { data: invoices }] = await Promise.all([
        admin.from("leads").select("name,company,stage,score,source").limit(50),
        admin.from("invoices").select("vendor,amount,status,due_date").limit(50),
      ]);
      if (leads && invoices) {
        const hot = leads.filter((l) => (l.score ?? 0) >= 80);
        const pending = invoices.filter((i) => i.status !== "Paid");
        return [
          `Lead Pipeline: ${leads.length} leads, ${hot.length} hot (score 80+).`,
          `Top leads: ${hot
            .slice(0, 5)
            .map((l) => `${l.name} (${l.company}, ${l.stage}, ${l.score})`)
            .join("; ")}.`,
          `Finance: ${pending.length} invoices pending; vendors ${pending
            .slice(0, 5)
            .map((i) => i.vendor)
            .join(", ")}.`,
        ].join("\n");
      }
    } catch {
      // fall through to seed summary
    }
  }

  const hot = LEADS.filter((l) => l.score >= 80);
  const pending = PAYABLES.filter((p) => p.status !== "paid");
  const pendTotal = pending.reduce((s, p) => s + parseAmt(p.amount), 0);
  return [
    `Lead Pipeline: ${LEADS.length} tracked leads, ${hot.length} hot (score 80+).`,
    `Pipeline by stage: ${PIPELINE_STAGES.map((s) => `${s.label} ${s.value}`).join(", ")}.`,
    `Top hot leads: ${hot.map((l) => `${l.name} (${l.company}, ${l.stage}, score ${l.score})`).join("; ")}.`,
    `Finance: ${pending.length} payables pending (€ ${pendTotal.toLocaleString()}), 0 overdue. July spend € ${FIN_MONTHLY[FIN_MONTHLY.length - 1].value.toLocaleString()}.`,
    `SEO: ${SEO.map((s) => `${s.keyword} pos ${s.position} (${s.impressions} impr)`).join("; ")}.`,
    `Content: 2 in review, 1 with Igor, 10 published this month.`,
  ].join("\n");
}
