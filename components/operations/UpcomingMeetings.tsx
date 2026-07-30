"use client";

import { useEffect, useState } from "react";
import Card from "@/components/shared/Card";
import { useActions } from "@/components/useActions";
import { MEETINGS } from "@/lib/data";
import { Meeting } from "@/lib/types";

// Upcoming meetings with one-tap Darwin prep. Pulls Camila's real calendar when
// connected; falls back to seed meetings in demo mode.
export default function UpcomingMeetings() {
  const { prepBrief } = useActions();
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.meetings)) setMeetings(j.meetings);
        setLive(Boolean(j.configured));
      })
      .catch(() => {});
  }, []);

  return (
    <Card style={{ flex: "1 1 300px" }}>
      <div className="section-head">
        <div className="eyebrow" style={{ margin: 0 }}>
          Upcoming meetings
        </div>
        {live && <div className="section-meta">Live calendar</div>}
      </div>
      {meetings.length === 0 ? (
        <div className="note">No meetings in the next 7 days.</div>
      ) : (
        meetings.map((m, i) => (
          <div className="action" key={i}>
            <div className="action-left">
              <div className="txt">
                <div className="t">{m.title}</div>
                <div className="d">
                  {m.who ? `${m.who} · ` : ""}
                  {m.when}
                </div>
              </div>
            </div>
            <button className="btn sm" onClick={() => prepBrief(`lead:${m.title}`)}>
              Prep brief
            </button>
          </div>
        ))
      )}
    </Card>
  );
}
