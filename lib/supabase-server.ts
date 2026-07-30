import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";

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

// Server client bound to the request cookies — used in Server Components,
// Route Handlers, and middleware for auth-aware, RLS-scoped reads.
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  const cookieStore = cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: any }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware
            // refreshes the session cookie on the response.
          }
        },
      },
    }
  );
}

// Service-role client for trusted server-side sync jobs. Bypasses RLS, so it
// must only ever be used inside API routes, never shipped to the browser.
export function createAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }
  return createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
