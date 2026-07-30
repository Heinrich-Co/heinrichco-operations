"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

// Turn an opaque auth/network error into something actionable. A browser
// "Failed to fetch" means the request never reached Supabase — almost always a
// wrong NEXT_PUBLIC_SUPABASE_URL (dashboard URL instead of the Project API URL),
// env vars that weren't redeployed, or a paused project.
function describeAuthError(raw: string): string {
  const m = (raw || "").toLowerCase();
  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed")) {
    return "Couldn't reach the authentication server. Check that NEXT_PUBLIC_SUPABASE_URL is the Project API URL (https://<ref>.supabase.co, not the dashboard URL), redeploy after changing env vars, and confirm the Supabase project isn't paused.";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "This email hasn't been confirmed yet. Confirm it from the Supabase Auth dashboard, or disable email confirmation for internal use.";
  }
  return raw || "Sign-in failed. Check the app configuration.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    const supabase = createClient();
    if (!supabase) {
      // Demo mode — no auth backend; enter the workspace directly.
      router.push("/");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsError(true);
        setMessage(describeAuthError(error.message));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setIsError(true);
      setMessage(describeAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setMessage(null);
    setIsError(false);
    const supabase = createClient();
    if (!supabase) {
      router.push("/");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setIsError(true);
        setMessage(
          error.message.includes("provider")
            ? "Google sign-in isn't enabled yet. Enable the Google provider in Supabase first, or use email + password."
            : describeAuthError(error.message)
        );
      }
    } catch (err) {
      setIsError(true);
      setMessage(describeAuthError(err instanceof Error ? err.message : ""));
    }
  };

  const forgot = async () => {
    const supabase = createClient();
    if (!supabase || !email) {
      setMessage("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setMessage(error ? error.message : "Password reset email sent.");
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="glyph" style={{ margin: "0 auto 18px", width: 30, height: 30, border: "2px solid var(--green)", position: "relative" }}>
            <span
              style={{ content: "", position: "absolute", inset: 7, background: "var(--green)", display: "block" }}
            />
          </div>
          <div className="w-mark">HEINRICH CO.</div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "var(--offwhite)",
              letterSpacing: "-0.02em",
              marginTop: 10,
            }}
          >
            Operations
          </div>
        </div>

        <button className="btn green" style={{ width: "100%", marginBottom: 16 }} onClick={signInGoogle}>
          Sign in with Google
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--gray-l)",
            fontSize: 12,
            margin: "8px 0 16px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--gray-d)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "var(--gray-d)" }} />
        </div>

        <form onSubmit={signInEmail} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            className="login-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="login-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <button
          onClick={forgot}
          style={{
            background: "none",
            border: "none",
            color: "var(--beige)",
            fontSize: 12.5,
            cursor: "pointer",
            marginTop: 14,
            display: "block",
            width: "100%",
            textAlign: "center",
          }}
        >
          Forgot password?
        </button>

        {message && (
          <div
            style={{
              color: isError ? "#E7B8B0" : "var(--green)",
              background: isError ? "rgba(176,74,62,0.18)" : "transparent",
              border: isError ? "1px solid var(--brick)" : "none",
              padding: isError ? "10px 12px" : 0,
              borderRadius: 3,
              fontSize: 12.5,
              marginTop: 14,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div style={{ color: "var(--gray-l)", fontSize: 11.5, marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
            Demo mode — Supabase is not configured. Any button enters the workspace with
            sample data. Configure NEXT_PUBLIC_SUPABASE_URL to enable real auth.
          </div>
        )}

        <div className="w-foot" style={{ textAlign: "center" }}>
          CONFIDENTIAL · INTERNAL USE ONLY
        </div>
      </div>
    </div>
  );
}
