import { google } from "googleapis";

/*
 * Delegated Google auth for acting AS a Workspace user (drafting Gmail,
 * creating Calendar events). Requires the service account to have domain-wide
 * delegation and GOOGLE_WORKSPACE_SUBJECT set to the user to impersonate.
 * Returns null when not configured — callers fall back to compose-only.
 */
export function getDelegatedAuth(scopes: string[], subject?: string) {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sub = subject || process.env.GOOGLE_WORKSPACE_SUBJECT;
  if (!email || !key || !sub) return null;
  return new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes,
    subject: sub,
  });
}

// Build a base64url-encoded RFC 2822 message for the Gmail drafts API.
export function toRawMessage(to: string, subject: string, body: string): string {
  const lines = [
    to ? `To: ${to}` : "",
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].filter(Boolean);
  return Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export { google };
