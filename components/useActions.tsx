"use client";

import { useUI } from "@/components/AppProviders";

// Shared one-tap actions (Prep Brief, Review Campaign) reused across pages —
// mirrors the prototype's modal + toast behaviour.
export function useActions() {
  const { showModal, toast } = useUI();

  function prepBrief(name?: string) {
    const who =
      name && name.indexOf("lead:") === 0 ? name.slice(5) : "Purney Ghatate (AkzoNobel)";
    showModal({
      kicker: "Meeting prep · Darwin generated",
      title: "Call brief — " + who,
      body: (
        <>
          <p>
            A concise brief the live version generates on one click, using account
            signals and matched services.
          </p>
          <h5>Account signals</h5>
          <p>
            Digital-stage organisation with fragmented tooling; public commitment to
            data integration this year.
          </p>
          <h5>Matched solution</h5>
          <p>
            symb.[aura] — smart BI with natural-language interpretation, with a path
            toward an ecosymb integration.
          </p>
          <h5>Questions to open with</h5>
          <p>
            1. Where does fragmented data cost you the most decision time?
            <br />
            2. Which team would feel the fastest relief from a single source of truth?
            <br />
            3. What has held back previous integration attempts?
          </p>
        </>
      ),
    });
  }

  function reviewCampaign() {
    showModal({
      kicker: "Campaign · Darwin analysis",
      title: "Healthcare B — response rate review",
      body: (
        <>
          <p>
            Response rate is down 3% week-on-week, concentrated at step 2 of 6 — a
            timing issue, not targeting.
          </p>
          <h5>Recommendation</h5>
          <p>
            Shorten the gap between step 1 and 2 from 4 days to 2, and lead with the
            single-source-of-truth outcome rather than the feature list.
          </p>
        </>
      ),
    });
  }

  return { prepBrief, reviewCampaign, toast };
}
