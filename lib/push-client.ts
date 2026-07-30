// Client-side Web Push subscription helper.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushResult =
  | { ok: true }
  | { ok: false; reason: string };

// Requests notification permission, subscribes via the service worker, and
// registers the subscription with the server.
export async function subscribeToPush(): Promise<PushResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "Push is not supported on this device." };
  }
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) {
    return { ok: false, reason: "Push not configured (missing VAPID key)." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." };
  }

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });
  if (!res.ok) return { ok: false, reason: "Server rejected the subscription." };
  return { ok: true };
}
