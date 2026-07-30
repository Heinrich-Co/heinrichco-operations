import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// A valid https URL is required; a malformed NEXT_PUBLIC_SUPABASE_URL (missing
// https://, trailing slash, stray quotes) is the most common cause of a
// middleware crash, so validate it up front rather than letting the client throw.
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
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON);

// Refreshes the Supabase session and gates the app behind auth WHEN Supabase is
// configured. In demo mode (no Supabase env) it is a pass-through so the sample
// app is fully usable. Any failure fails OPEN (app still loads) rather than
// returning a 500 for the whole site.
export async function middleware(req: NextRequest) {
  if (!isConfigured) return NextResponse.next();

  let res = NextResponse.next({ request: req });

  try {
    const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON!, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = req.nextUrl;
    const isPublic =
      pathname.startsWith("/login") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api");

    if (!user && !isPublic) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return res;
  } catch {
    // Never take the whole app down if the auth check fails — let the request
    // through. Data stays protected by row-level security regardless.
    return res;
  }
}

export const config = {
  // Run on all routes except static assets and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
