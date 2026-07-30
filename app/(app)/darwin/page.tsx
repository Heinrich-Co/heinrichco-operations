"use client";

import { useEffect, useRef, useState } from "react";
import { useUI } from "@/components/AppProviders";
import Card from "@/components/shared/Card";
import { DARWIN_COMMANDS } from "@/lib/data";
import { matchDarwin } from "@/lib/format";

export default function DarwinPage() {
  const { user } = useUI();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const outRef = useRef<HTMLDivElement>(null);

  const run = async (command: string) => {
    if (!command.trim() || running) return;
    setRunning(true);
    setOutput("");
    setRecent((r) => [command, ...r.filter((x) => x !== command)].slice(0, 6));

    try {
      const res = await fetch("/api/darwin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          role: user.role,
          roleName: user.title,
        }),
      });
      if (!res.ok || !res.body) throw new Error("darwin failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      // Stream chunks in for a natural typewriter effect.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
        if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
      }
    } catch {
      // Fallback: typewrite the closest canned response locally.
      const res = await fetch("/api/darwin/fallback?key=" + encodeURIComponent(matchDarwin(command)));
      const text = res.ok ? await res.text() : "Darwin is unavailable right now.";
      await typewrite(text);
    } finally {
      setRunning(false);
    }
  };

  const typewrite = (text: string) =>
    new Promise<void>((resolve) => {
      let i = 0;
      const stepSize = Math.max(2, Math.round(text.length / 120));
      const tick = () => {
        if (i <= text.length) {
          setOutput(text.slice(0, i));
          i += stepSize;
          setTimeout(tick, 12);
        } else {
          setOutput(text);
          resolve();
        }
      };
      tick();
    });

  // Auto-run a query passed from the home "Ask Darwin" shortcut (?q=...).
  const didAuto = useRef(false);
  useEffect(() => {
    if (didAuto.current) return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      didAuto.current = true;
      setInput(q);
      run(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card eyebrow="Darwin — the intelligence layer">
        <div className="darwin-in">
          <input
            value={input}
            placeholder="Ask Darwin — e.g. give me the weekly pulse, or enrich the AkzoNobel lead"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(input || "Weekly Pulse")}
          />
          <button className="btn green" disabled={running} onClick={() => run(input || "Weekly Pulse")}>
            {running ? "Running…" : "Run"}
          </button>
        </div>
        <div className="cmds">
          {DARWIN_COMMANDS.map((c) => (
            <button key={c} onClick={() => run(c)} disabled={running}>
              {c}
            </button>
          ))}
        </div>
        <div className={`darwin-out ${output ? "" : "empty"}`} ref={outRef}>
          {output ||
            "Darwin is embedded in every domain — click a command above, or type your own. When ANTHROPIC_API_KEY is configured this runs live against the Claude API with Heinrich Co. context."}
        </div>
      </Card>

      {recent.length > 0 && (
        <Card eyebrow="Recent commands" style={{ marginTop: 16 }}>
          {recent.map((r, i) => (
            <div className="autorow" key={i}>
              <div style={{ color: "var(--gray-d)" }}>{r}</div>
              <button className="btn sm ghost" onClick={() => run(r)} disabled={running}>
                Re-run
              </button>
            </div>
          ))}
        </Card>
      )}

      <div className="note">
        Responses cite the specific data point behind each recommendation. In production
        Darwin runs against your app data and Sheets as live context.
      </div>
    </>
  );
}
