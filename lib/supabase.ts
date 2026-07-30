import { createBrowserClient } from "@supabase/ssr";

// A Supabase URL must be a real https URL. A malformed value (missing https://,
// trailing slash, stray quotes) is treated as "not configured" so the app runs
// in demo mode instead of silently failing to sign in.
function validSupabaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return raw.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

const SUPABASE_URL = validSupabaseUrl();
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON);

// Browser client — safe in Client Components. Returns null when Supabase is not
// configured (demo mode) or the URL is invalid.
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
  } catch {
    return null;
  }
}
