import { createAdminClient } from "./supabase-server";

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

// Appends an entry to the audit_log. No-ops (configured:false) in demo mode.
export async function logAudit(entry: AuditEntry): Promise<{ configured: boolean }> {
  const supabase = createAdminClient();
  if (!supabase) return { configured: false };
  try {
    await supabase.from("audit_log").insert({
      user_id: entry.userId ?? null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      details: entry.details ?? null,
    });
    return { configured: true };
  } catch {
    return { configured: false };
  }
}
