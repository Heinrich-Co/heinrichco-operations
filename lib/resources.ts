// Shared resource registry — the single place that maps a logical resource name
// to its Supabase table. Adding a new data source is a one-line addition here
// plus a mapper in lib/data-source.ts. Safe to import from client or server.

export interface ResourceConfig {
  table: string;
  realtime: boolean; // subscribe to live changes when Supabase is configured
}

export const RESOURCES: Record<string, ResourceConfig> = {
  leads: { table: "leads", realtime: true },
  invoices: { table: "invoices", realtime: true },
  bookings: { table: "bookings", realtime: true },
  campaigns: { table: "campaigns", realtime: false },
  content: { table: "content", realtime: true },
  clients: { table: "client_engagements", realtime: true },
};

export type ResourceName = keyof typeof RESOURCES;

export function isResource(name: string): name is ResourceName {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name);
}
