import { createAdminClient } from "./supabase-server";
import { RESOURCES, ResourceName } from "./resources";
import { BOOKINGS, CONTENT, ENGAGEMENTS, LEADS, PAYABLES } from "./data";
import { ContentItem, Lead, Payable } from "./types";

/*
 * Server-side data layer. Every page/API reads a resource through here instead
 * of talking to a specific source directly. Today it resolves to Supabase (when
 * configured) or the seed data. Tomorrow, a new external source (another API, a
 * warehouse, a partner feed) is added by:
 *   1. registering the resource in lib/resources.ts, and
 *   2. adding a branch to fetchFromSource() below.
 * The rest of the app keeps calling readResource(name) unchanged.
 */

// Map a Supabase `leads` row to the UI Lead shape.
function mapLead(row: Record<string, any>, i: number): Lead {
  const score = Number(row.score ?? 0);
  return {
    id: typeof row.id === "number" ? row.id : i,
    name: row.name ?? "",
    company: row.company ?? "",
    sector: row.sector ?? "",
    stage: row.stage ?? "New",
    score,
    source: row.source ?? "",
    hot: score >= 80,
  };
}

// Map a Supabase `invoices` row to the UI Payable shape.
function mapInvoice(row: Record<string, any>): Payable {
  const status = String(row.status ?? "Pending").toLowerCase();
  return {
    id: String(row.id),
    vendor: row.vendor ?? "",
    category: row.category ?? "",
    amount: `€ ${Number(row.amount ?? 0).toLocaleString()}`,
    status: (status === "paid" ? "paid" : status === "overdue" ? "overdue" : "pending"),
  };
}

// Map a Supabase `content` row to the UI ContentItem shape.
function mapContent(row: Record<string, any>): ContentItem {
  return {
    id: String(row.id),
    title: row.title ?? "",
    meta: [row.content_type, row.platform].filter(Boolean).join(" · ") || "Content",
    status: row.approval_status ?? "Draft",
  };
}

const SEED: Record<ResourceName, unknown[]> = {
  leads: LEADS,
  invoices: PAYABLES,
  bookings: BOOKINGS,
  campaigns: [],
  content: CONTENT,
  clients: ENGAGEMENTS,
};

const MAPPERS: Partial<Record<ResourceName, (row: Record<string, any>, i: number) => unknown>> = {
  leads: mapLead,
  invoices: mapInvoice,
  content: mapContent,
};

// Read a resource — Supabase when configured, otherwise seed data.
export async function readResource(name: ResourceName): Promise<unknown[]> {
  const supabase = createAdminClient();
  const cfg = RESOURCES[name];

  if (supabase && cfg) {
    try {
      const { data, error } = await supabase.from(cfg.table).select("*").limit(500);
      if (!error && data && data.length) {
        const mapper = MAPPERS[name];
        return mapper ? data.map((row, i) => mapper(row as Record<string, any>, i)) : data;
      }
      // Table empty → fall through to seed so screens stay meaningful.
    } catch {
      /* fall through to seed */
    }
  }

  return SEED[name] ?? [];
}
