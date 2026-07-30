"use client";

import { useUI } from "@/components/AppProviders";
import Card from "@/components/shared/Card";
import Chip from "@/components/shared/Chip";
import AuditLog from "@/components/operations/AuditLog";
import UpcomingMeetings from "@/components/operations/UpcomingMeetings";
import { canSeeFinance } from "@/lib/roles";
import { AUTOMATIONS, DOCS, TASKS } from "@/lib/data";
import { C } from "@/lib/palette";

export default function OperationsPage() {
  const { user, showModal, toast } = useUI();

  const statusVariant = (status: string): "overdue" | "pending" | "neutral" =>
    status === "Blocked" ? "overdue" : status === "In progress" ? "pending" : "neutral";

  const showLog = (name: string) =>
    showModal({
      kicker: "Automation · error log",
      title: name,
      body: (
        <>
          <p>The last run failed. Most recent log entries:</p>
          <h5>Trace</h5>
          <p style={{ fontFamily: "monospace", fontSize: 12.5, whiteSpace: "pre-wrap" }}>
            {`[3h ago] Fetching source rows… ok (42)
[3h ago] Mapping to Supabase schema…
[3h ago] ERROR: 429 rate_limited from Sheets API
[3h ago] Retry 1/3 in 30s… failed
[3h ago] Halted — will retry on next scheduled run`}
          </p>
          <h5>Suggested fix</h5>
          <p>Stagger the sync window and add exponential backoff on 429 responses.</p>
        </>
      ),
    });

  return (
    <>
      <Card eyebrow="Team tasks — this week" style={{ marginBottom: 16 }}>
        <div className="scroll-x">
          <table className="hco">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Task</th>
                <th>Status</th>
                <th className="tr-num">Due</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, color: "var(--black)" }}>{t.who}</td>
                  <td>{t.task}</td>
                  <td>
                    <Chip variant={statusVariant(t.status)}>{t.status}</Chip>
                  </td>
                  <td className="tr-num">{t.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="row" style={{ marginBottom: 16 }}>
        <Card eyebrow="Automation status" style={{ flex: "1 1 300px" }}>
          {AUTOMATIONS.map((a, i) => {
            const color = a.state === "error" ? C.brick : C.greenDD;
            return (
              <div
                className="autorow"
                key={i}
                onClick={() => a.state === "error" && showLog(a.name)}
                style={{ cursor: a.state === "error" ? "pointer" : "default" }}
              >
                <div>
                  <span className="dot" style={{ background: color }} />
                  <span style={{ fontWeight: 500, color: "var(--black)" }}>{a.name}</span>
                  <div style={{ fontSize: 12, color: "var(--gray-l)", marginLeft: 15 }}>
                    Last run · {a.last}
                  </div>
                </div>
                <span style={{ fontSize: 12.5, color, fontWeight: 600 }}>
                  {a.state === "error" ? "Error" : "Running"}
                </span>
              </div>
            );
          })}
        </Card>
        <UpcomingMeetings />
      </div>

      <Card eyebrow="Document hub">
        <div className="link-list">
          {DOCS.map((d, i) => (
            <a key={i} onClick={() => toast(`Opening: ${d.title}`)}>
              <span>
                {d.title}{" "}
                <span style={{ color: "var(--gray-l)", fontSize: 12 }}>· {d.meta}</span>
              </span>
              <span className="arr">Open →</span>
            </a>
          ))}
        </div>
      </Card>

      {canSeeFinance(user) && <AuditLog />}
    </>
  );
}
