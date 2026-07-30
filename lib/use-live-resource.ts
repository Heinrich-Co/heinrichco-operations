"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase";
import { RESOURCES, ResourceName } from "./resources";

/*
 * Client hook that reads a resource through the data API and keeps it live.
 * - Renders instantly from `initialData` (seed) so there's never a blank state.
 * - Fetches the latest from /api/data/<resource> on mount.
 * - When Supabase is configured and the resource is realtime-enabled, subscribes
 *   to table changes and refetches — so new bookings/invoices/leads appear
 *   without a manual refresh. In demo mode it's a no-op beyond the initial fetch.
 */
export function useLiveResource<T>(resource: ResourceName, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/data/${resource}`);
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) setData(json.data as T[]);
    } catch {
      /* keep current data */
    }
  }, [resource]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const cfg = RESOURCES[resource];
    if (!cfg?.realtime) return;
    const supabase = createClient();
    if (!supabase) return; // demo mode — no realtime

    const channel = supabase
      .channel(`realtime:${cfg.table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: cfg.table },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resource, refetch]);

  return { data, refetch };
}
