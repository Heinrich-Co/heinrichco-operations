import webpush from "web-push";
import { createAdminClient } from "./supabase-server";

let configured = false;

// Configure web-push with VAPID keys once. Returns false if keys are missing.
function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:ops@heinrichco-ai.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// Sends a push notification to every stored subscription. Prunes dead ones.
export async function sendPushToAll(
  payload: PushPayload
): Promise<{ configured: boolean; sent: number }> {
  const supabase = createAdminClient();
  if (!ensureConfigured() || !supabase) return { configured: false, sent: 0 };

  const { data } = await supabase.from("push_subscriptions").select("endpoint,subscription");
  const subs = data ?? [];
  let sent = 0;

  await Promise.all(
    subs.map(async (row: { endpoint: string; subscription: unknown }) => {
      try {
        await webpush.sendNotification(
          row.subscription as webpush.PushSubscription,
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        // 404/410 → subscription expired; remove it.
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        }
      }
    })
  );

  return { configured: true, sent };
}
