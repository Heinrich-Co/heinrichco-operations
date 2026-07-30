"use client";

import { useState } from "react";
import { useUI } from "@/components/AppProviders";
import { useActions } from "@/components/useActions";
import { LEADS } from "@/lib/data";
import { matchedSolution } from "@/lib/format";

// Slide-in lead detail panel. On mobile it becomes a full-screen overlay
// (handled in globals.css).
export default function LeadDrawer() {
  const { leadId, closeLead, showModal, toast } = useUI();
  const { prepBrief } = useActions();
  const [busy, setBusy] = useState(false);
  const lead = leadId != null ? LEADS[leadId] : null;

  const generateFollowUp = async () => {
    if (!lead || busy) return;
    setBusy(true);
    toast("Darwin is drafting a follow-up…");
    try {
      const res = await fetch("/api/actions/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, company: lead.company, sector: lead.sector }),
      });
      const data = await res.json();
      showModal({
        kicker: data.created ? "Follow-up · saved to Gmail drafts" : "Follow-up · Darwin drafted",
        title: data.subject || `Follow-up — ${lead.company}`,
        body: (
          <>
            <p style={{ whiteSpace: "pre-wrap" }}>{data.body}</p>
            {!data.configured && (
              <p className="note">
                Connect Google (GOOGLE_WORKSPACE_SUBJECT) to save this straight to Gmail
                drafts.
              </p>
            )}
          </>
        ),
      });
    } catch {
      toast("Could not draft the follow-up.");
    } finally {
      setBusy(false);
    }
  };

  const draftProposal = async () => {
    if (!lead || busy) return;
    setBusy(true);
    toast("Darwin is drafting a proposal…");
    try {
      const res = await fetch("/api/actions/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, company: lead.company, sector: lead.sector }),
      });
      const data = await res.json();
      showModal({
        kicker: "Proposal · Darwin drafted",
        title: data.title || `Proposal — ${lead.company}`,
        body: <p style={{ whiteSpace: "pre-wrap" }}>{data.body}</p>,
      });
    } catch {
      toast("Could not draft the proposal.");
    } finally {
      setBusy(false);
    }
  };

  const scheduleFollowUp = async () => {
    if (!lead || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/actions/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Follow-up — ${lead.company}` }),
      });
      const data = await res.json();
      toast(
        data.created
          ? "Follow-up added to your calendar"
          : "Follow-up proposed — connect Calendar to book it"
      );
    } catch {
      toast("Could not schedule the follow-up.");
    } finally {
      setBusy(false);
    }
  };

  const parts = lead
    ? [
        { lab: "Fit to ICP", v: Math.min(99, lead.score + 4) },
        { lab: "Engagement", v: Math.max(20, lead.score - 8) },
        { lab: "Timing signals", v: Math.max(15, lead.score - 14) },
        { lab: "Budget indicators", v: Math.max(25, lead.score - 6) },
      ]
    : [];

  const timeline = lead
    ? [
        { d: "Today", x: `${lead.stage} stage — awaiting next step` },
        { d: "3 days ago", x: "Enriched by Darwin" },
        { d: "1 week ago", x: `Entered pipeline via ${lead.source}` },
      ]
    : [];

  return (
    <>
      <div
        className={`drawer-ov ${lead ? "open" : ""}`}
        onClick={closeLead}
        aria-hidden={!lead}
      />
      <aside className={`drawer ${lead ? "open" : ""}`} aria-hidden={!lead}>
        {lead && (
          <>
            <div className="dh">
              <button className="close" onClick={closeLead} aria-label="Close">
                &times;
              </button>
              <div className="co">
                {lead.company} · {lead.sector}
              </div>
              <div className="nm">{lead.name}</div>
              <div className="meta">
                Score {lead.score} · {lead.stage} · via {lead.source}
              </div>
            </div>
            <div className="db">
              <div className="dsec">Score breakdown</div>
              {parts.map((p) => (
                <div className="sb-row" key={p.lab}>
                  <div className="lab">
                    <span>{p.lab}</span>
                    <span>{p.v}</span>
                  </div>
                  <div className="scorebar">
                    <i style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              ))}

              <div className="dsec">Matched solution</div>
              <div style={{ fontSize: 14, color: "var(--gray-d)", lineHeight: 1.6 }}>
                {matchedSolution(lead.sector)} — aligned to a{" "}
                {lead.sector.toLowerCase()} transformation path.
              </div>

              <div className="dsec">History</div>
              <div className="tl">
                {timeline.map((e, i) => (
                  <div className="ev" key={i}>
                    <div className="d">{e.d}</div>
                    <div className="x">{e.x}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  onClick={() => {
                    closeLead();
                    prepBrief(`lead:${lead.name}`);
                  }}
                >
                  Prep meeting
                </button>
                <button className="btn ghost" onClick={generateFollowUp} disabled={busy}>
                  Generate follow-up
                </button>
                <button className="btn ghost" onClick={draftProposal} disabled={busy}>
                  Draft proposal
                </button>
                <button className="btn ghost" onClick={scheduleFollowUp} disabled={busy}>
                  Schedule follow-up
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
