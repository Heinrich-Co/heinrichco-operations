"use client";

import { useState } from "react";
import { useUI } from "@/components/AppProviders";
import Card from "@/components/shared/Card";
import { AI_VISIBILITY, IGOR_QUEUE, KANBAN, KANBAN_COLS, SEO, SOCIAL } from "@/lib/data";
import { KanbanCard } from "@/lib/types";

export default function MarketingPage() {
  const { toast } = useUI();
  const [board, setBoard] = useState<Record<string, KanbanCard[]>>(KANBAN);

  // The content pipeline is managed natively in-app (no Notion). Each card
  // advances Draft → Approved → Design → Published, persisting each move.
  const NEXT: Record<string, string> = { Draft: "Approved", Approved: "Design", Design: "Published" };
  const ADVANCE_LABEL: Record<string, string> = {
    Draft: "Approve",
    Approved: "To design",
    Design: "Publish",
  };

  const advance = (col: string, idx: number) => {
    const to = NEXT[col];
    if (!to) return;
    const card = board[col]?.[idx];
    setBoard((b) => {
      const next: Record<string, KanbanCard[]> = {};
      KANBAN_COLS.forEach((c) => (next[c] = [...(b[c] || [])]));
      const [moved] = next[col].splice(idx, 1);
      if (moved) next[to].push(moved);
      return next;
    });
    fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "content", id: card?.title, status: to, title: card?.title }),
    }).catch(() => {});
    toast(col === "Draft" ? "Approved — moved to Approved" : `Moved to ${to}`);
  };

  const addDraft = () => {
    const title = window.prompt("New content title");
    if (!title) return;
    const card: KanbanCard = { title, meta: "Blog · Draft" };
    setBoard((b) => ({ ...b, Draft: [...(b.Draft || []), card] }));
    fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "Draft" }),
    }).catch(() => {});
    toast("Draft created");
  };

  const allBlocked = AI_VISIBILITY.every((a) => a.pct === 0);

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-head">
          <div className="eyebrow" style={{ margin: 0 }}>
            Content pipeline
          </div>
          <button className="btn sm ghost" onClick={addDraft}>
            + New draft
          </button>
        </div>
        <div className="kanban">
          {KANBAN_COLS.map((col) => (
            <div className="kcol" key={col}>
              <h4>
                {col}
                <span>{(board[col] || []).length}</span>
              </h4>
              {(board[col] || []).map((c, i) => (
                <div className="kcard" key={i}>
                  {c.title}
                  <div className="m">{c.meta}</div>
                  {NEXT[col] && (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn sm" onClick={() => advance(col, i)}>
                        {ADVANCE_LABEL[col]}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <div className="row" style={{ marginBottom: 16 }}>
        <Card eyebrow="SEO — tracked keywords" style={{ flex: "2 1 340px" }}>
          <div className="scroll-x">
            <table className="hco">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th className="tr-num">Position</th>
                  <th className="tr-num">CTR</th>
                  <th className="tr-num">Impressions</th>
                </tr>
              </thead>
              <tbody>
                {[...SEO]
                  .sort(
                    (a, b) =>
                      parseFloat(b.impressions.replace(/,/g, "")) -
                      parseFloat(a.impressions.replace(/,/g, ""))
                  )
                  .map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: "var(--black)" }}>{s.keyword}</td>
                      <td className="tr-num">{s.position}</td>
                      <td className="tr-num">{s.ctr}</td>
                      <td className="tr-num">{s.impressions}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card eyebrow="Social media" style={{ flex: "1 1 240px" }}>
          {SOCIAL.map((s, i) => (
            <div className="autorow" key={i}>
              <div style={{ fontWeight: 500, color: "var(--black)" }}>{s.channel}</div>
              <div style={{ fontSize: 13, color: "var(--gray-d)" }}>
                {s.followers} followers · {s.reach} reach · {s.engagement} eng.
              </div>
            </div>
          ))}
          <div className="note">
            LinkedIn is the primary authority channel. Instagram carries lighter
            adaptations.
          </div>
        </Card>
      </div>

      <Card eyebrow="AI visibility — where Heinrich Co. shows up" style={{ marginBottom: 16 }}>
        {allBlocked ? (
          <div className="note">AI crawlers currently blocked. Fix in progress.</div>
        ) : (
          AI_VISIBILITY.map((a) => (
            <div className="aiv-row" key={a.platform}>
              <div className="plat">{a.platform}</div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div className="track">
                  <i style={{ width: `${a.pct}%` }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-l)", marginTop: 5 }}>{a.query}</div>
              </div>
              <div className="pct">{a.pct}%</div>
            </div>
          ))
        )}
        <div className="note">
          Weekly tracking of how often we are cited by AI assistants — a channel most
          competitors do not measure.
        </div>
      </Card>

      <Card eyebrow="Igor — design queue">
        {IGOR_QUEUE.map((q, i) => (
          <div className="autorow" key={i}>
            <div>
              <div style={{ fontWeight: 500, color: "var(--black)" }}>{q.title}</div>
              <div style={{ fontSize: 12, color: "var(--gray-l)" }}>{q.meta}</div>
            </div>
            <button className="btn sm ghost" onClick={() => toast("Opened in design queue")}>
              Open
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}
