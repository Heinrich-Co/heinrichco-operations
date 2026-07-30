import { google } from "googleapis";

// Service-account auth for Google Sheets / Calendar sync. Returns null when the
// service-account env vars are not configured.
export function getGoogleAuth(scopes: string[]) {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!email || !key) return null;
  return new google.auth.JWT({
    email,
    // Vercel stores the key with escaped newlines.
    key: key.replace(/\\n/g, "\n"),
    scopes,
  });
}

export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — allow (e.g. local/dev)
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
