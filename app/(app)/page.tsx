"use client";

import { useUI } from "@/components/AppProviders";
import { useActions } from "@/components/useActions";
import Kpi from "@/components/shared/Kpi";
import Card from "@/components/shared/Card";
import AskDarwin from "@/components/home/AskDarwin";
import RunwayBanner from "@/components/home/RunwayBanner";
import { canSeeFinance } from "@/lib/roles";
import { ACTIONS, KPIS } from "@/lib/data";
import { greeting, longDate } from "@/lib/format";

export default function HomePage() {
  const { user } = useUI();
  const { prepBrief, reviewCampaign, toast } = useActions();
  const firstName = user.name.split(" ")[0];

  const kpiOrder = [KPIS.pipeline, KPIS.finance, KPIS.content, KPIS.marketing];

  const runAction = (act: string, arg: string) => {
    if (act === "prep") prepBrief(arg);
    else if (act === "pay") toast("Marked as paid — ledger updated");
    else if (act === "review") reviewCampaign();
  };

  const label = (act: string) =>
    act === "prep" ? "Prep Brief" : act === "pay" ? "Mark Paid" : "Review";

  return (
    <>
      <div className="hero">
        <div className="hi">
          {greeting()}, {firstName}.
        </div>
        <div className="date">{longDate()}</div>
        <div className="focus">{user.focus}</div>
      </div>

      <div className="section-head">
        <div className="eyebrow" style={{ margin: 0 }}>
          Weekly snapshot
        </div>
        <div className="section-meta">Updated just now</div>
      </div>
      <div className="row" style={{ margin: "0 0 20px" }}>
        {kpiOrder.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} trend={k.trend} />
        ))}
      </div>

      {canSeeFinance(user) && <RunwayBanner />}

      <Card>
        <div className="section-head" style={{ marginBottom: 4 }}>
          <div className="eyebrow" style={{ margin: 0 }}>
            Needs your attention
          </div>
          <span className="count-pill">{ACTIONS.length}</span>
        </div>
        {ACTIONS.map((a, i) => (
          <div className="action" key={i}>
            <div className="action-left">
              <div className="idx">{i + 1}</div>
              <div className="txt">
                <div className="t">{a.title}</div>
                <div className="d">{a.detail}</div>
              </div>
            </div>
            <button className="btn sm" onClick={() => runAction(a.act, a.arg)}>
              {label(a.act)}
            </button>
          </div>
        ))}
      </Card>

      <AskDarwin />

      <div className="note">
        Your Weekly Pulse and Executive Summary, combined into one screen. Every card
        ends in an action, not just a number.
      </div>
    </>
  );
}
