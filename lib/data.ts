import { C } from "./palette";
import {
  AiVisibilityRow,
  AlertItem,
  Automation,
  Booking,
  CaptureSample,
  ChartDatum,
  DocLink,
  KanbanCard,
  KpiCard,
  Lead,
  Meeting,
  Payable,
  QueueItem,
  Recurring,
  SeoRow,
  SocialRow,
  TeamTask,
} from "./types";

/*
 * Seed data mirrors the prototype's sample data set. The app reads from Supabase
 * when it is configured (see lib/queries.ts); until a table has been populated by
 * a sync job, these values keep every screen meaningful instead of blank.
 */

export const KPIS: Record<string, KpiCard> = {
  pipeline: {
    label: "Pipeline",
    value: "€ 182.4K",
    sub: ["25 active leads", "4 hot leads"],
    trend: { dir: "up", label: "12% vs last week", tone: "good" },
  },
  finance: {
    label: "Finance",
    value: "3 pending",
    sub: ["0 overdue", "€ 3,924 paid this month"],
    trend: { dir: "flat", label: "0 overdue — on track", tone: "neutral" },
  },
  content: {
    label: "Content",
    value: "2 in review",
    sub: ["1 with Igor", "10 published"],
    trend: { dir: "up", label: "3 more than last week", tone: "good" },
  },
  marketing: {
    label: "Marketing",
    value: "16.9K impressions",
    sub: ["39 clicks", "22.1 avg. position"],
    trend: { dir: "down", label: "4% vs last week", tone: "bad" },
  },
};

export interface ActionItem {
  title: string;
  detail: string;
  act: "prep" | "pay" | "review";
  arg: string;
}

export const ACTIONS: ActionItem[] = [
  {
    title: "Purney Ghatate (AkzoNobel) — Discovery call at 2:30 PM",
    detail: "Hot lead · score 92 · matched to symb.[aura]",
    act: "prep",
    arg: "lead:Purney Ghatate (AkzoNobel)",
  },
  {
    title: "Invoice from Ana Ribeiro — € 2,784 pending",
    detail: "Freelancing · due in 4 days",
    act: "pay",
    arg: "ana",
  },
  {
    title: "Healthcare B campaign — response rate dropped 3%",
    detail: "Maverick sequence · 2 of 6 steps sent",
    act: "review",
    arg: "hcb",
  },
];

export const PIPELINE_STAGES: ChartDatum[] = [
  { label: "New", value: 9 },
  { label: "Qualified", value: 7 },
  { label: "Discovery", value: 5 },
  { label: "Proposal", value: 3 },
  { label: "Negotiation", value: 1 },
];

export const FORECAST: ChartDatum[] = [
  { label: "Jul", value: 38 },
  { label: "Aug", value: 52 },
  { label: "Sep", value: 41 },
  { label: "Oct", value: 63 },
  { label: "Nov", value: 49 },
  { label: "Dec", value: 58 },
];

// Deals with values + canonical sources, for the weighted forecast model.
export const DEALS: import("./types").Deal[] = [
  { name: "Purney Ghatate", company: "AkzoNobel", stage: "Discovery", value: 64000, source: "Ambassador", month: "2026-08" },
  { name: "Thomas Berg", company: "Novo Nordisk", stage: "Proposal", value: 120000, source: "SEO-Noa", month: "2026-09" },
  { name: "Marloes de Vries", company: "Philips Health", stage: "Negotiation", value: 85000, source: "Maverick", month: "2026-08" },
  { name: "Elif Demir", company: "Arçelik", stage: "Discovery", value: 48000, source: "Presto", month: "2026-10" },
  { name: "Lucas Almeida", company: "Natura", stage: "Proposal", value: 52000, source: "Ambassador", month: "2026-09" },
  { name: "Sofie Jensen", company: "Maersk", stage: "Discovery", value: 73000, source: "SEO-Noa", month: "2026-11" },
];

export const LEADS: Lead[] = [
  { id: 0, name: "Purney Ghatate", company: "AkzoNobel", sector: "Manufacturing", stage: "Discovery", score: 92, source: "LinkedIn", hot: true },
  { id: 1, name: "Marloes de Vries", company: "Philips Health", sector: "Healthcare", stage: "Qualified", score: 88, source: "Website", hot: true },
  { id: 2, name: "Thomas Berg", company: "Novo Nordisk", sector: "Healthcare", stage: "Proposal", score: 85, source: "Referral", hot: true },
  { id: 3, name: "Elif Demir", company: "Arçelik", sector: "Manufacturing", stage: "Discovery", score: 81, source: "Event", hot: true },
  { id: 4, name: "Lucas Almeida", company: "Natura", sector: "Retail", stage: "Qualified", score: 74, source: "LinkedIn", hot: false },
  { id: 5, name: "Sofie Jensen", company: "Maersk", sector: "Supply Chain", stage: "New", score: 66, source: "Website", hot: false },
  { id: 6, name: "Daan Bakker", company: "Randstad", sector: "People & Dev", stage: "New", score: 61, source: "Referral", hot: false },
  { id: 7, name: "Beatriz Costa", company: "Dasa", sector: "Healthcare", stage: "Qualified", score: 58, source: "Event", hot: false },
];

// The 5-phase delivery framework (Discovery → Optimization), shared by the
// engagements tracker.
export const ENGAGEMENT_PHASES = [
  "Discovery",
  "Strategy",
  "Validation",
  "Implementation",
  "Optimization",
];

// Active client engagements (post Closed-Won). Knowledge transfer is tracked
// explicitly — it's the Heinrich Co. differentiator.
export const ENGAGEMENTS: import("./types").Engagement[] = [
  { id: "eng-akzo", company: "AkzoNobel", contact: "Purney Ghatate", sector: "Manufacturing", service: "symb.[aura]", phase: "Implementation", owner: "Matheus", value: 64000, kt: "In progress", nextMilestone: "UAT sign-off · 12 Aug", start: "2026-05-02" },
  { id: "eng-novo", company: "Novo Nordisk", contact: "Thomas Berg", sector: "Healthcare", service: "ecosymb.[care]", phase: "Validation", owner: "Camila", value: 120000, kt: "Not started", nextMilestone: "Pilot review · 08 Aug", start: "2026-06-10" },
  { id: "eng-natura", company: "Natura", contact: "Lucas Almeida", sector: "Retail", service: "symb.[momentum]", phase: "Optimization", owner: "Ana", value: 52000, kt: "Complete", nextMilestone: "Handover complete", start: "2026-03-18" },
  { id: "eng-maersk", company: "Maersk", contact: "Sofie Jensen", sector: "Supply Chain", service: "symb.[aura]", phase: "Strategy", owner: "Matheus", value: 73000, kt: "Not started", nextMilestone: "Roadmap approval · 15 Aug", start: "2026-07-01" },
];

export const BOOKINGS: Booking[] = [
  { name: "Marloes de Vries", when: "Today · 11:00", service: "Intro call — ecosymb.[care]" },
  { name: "Yusuf Kaya", when: "Tomorrow · 15:30", service: "AI-Native diagnosis" },
  { name: "Renata Lopes", when: "Thu · 09:00", service: "symb.[momentum] walkthrough" },
];

export const PAYABLES: Payable[] = [
  { id: "ana", vendor: "Ana Ribeiro", category: "Freelancing", amount: "€ 2,784", status: "pending" },
  { id: "genzone", vendor: "GenZone LLC", category: "Consultant", amount: "€ 1,120", status: "pending" },
  { id: "igor", vendor: "Igor Kretteis ME", category: "Freelancing", amount: "€ 846", status: "pending" },
  { id: "anthropic", vendor: "Anthropic", category: "Software", amount: "€ 68", status: "paid" },
  { id: "gws", vendor: "Google Workspace", category: "Software", amount: "€ 49", status: "paid" },
  { id: "vercel", vendor: "Vercel", category: "Software", amount: "€ 20", status: "paid" },
];

export const FIN_CATS: ChartDatum[] = [
  { label: "Software", value: 1420 },
  { label: "Freelancing", value: 3630 },
  { label: "Consultant", value: 1120 },
  { label: "Travel", value: 540 },
];

export const FIN_MONTHLY: ChartDatum[] = [
  { label: "Feb", value: 4100 },
  { label: "Mar", value: 5200 },
  { label: "Apr", value: 3800 },
  { label: "May", value: 4600 },
  { label: "Jun", value: 3100 },
  { label: "Jul", value: 3924 },
];

export const RECURRING: Recurring[] = [
  { vendor: "Anthropic (Claude API)", next: "01 Aug", amount: "€ 68" },
  { vendor: "Google Workspace", next: "03 Aug", amount: "€ 49" },
  { vendor: "mLabs", next: "12 Aug", amount: "€ 29" },
  { vendor: "Netlify", next: "19 Aug", amount: "€ 0" },
];

export const KANBAN: Record<string, KanbanCard[]> = {
  Draft: [
    { title: "FOREWORD: The cost of fragmented tooling", meta: "Blog · EN/PT" },
    { title: "Instagram carousel — Symbiosis", meta: "Social · PT" },
  ],
  Approved: [{ title: "AI-Native maturity: the 4 stages", meta: "Blog · EN/PT" }],
  Design: [{ title: "LinkedIn: Structure before tech", meta: "With Igor · due Fri" }],
  Published: [
    { title: "Leadership through discomfort", meta: "LinkedIn · 3d ago" },
    { title: "symb.[coach] launch note", meta: "LinkedIn · 6d ago" },
  ],
};

export const KANBAN_COLS = ["Draft", "Approved", "Design", "Published"];

// Native content items (content is now managed in-app, not synced from Notion).
export const CONTENT: import("./types").ContentItem[] = KANBAN_COLS.flatMap((col) =>
  (KANBAN[col] || []).map((c, i) => ({
    id: `${col.toLowerCase()}-${i}`,
    title: c.title,
    meta: c.meta,
    status: col,
  }))
);

export const SEO: SeoRow[] = [
  { keyword: "AI-Native transformation", position: "3.2", ctr: "6.1%", impressions: "4,210" },
  { keyword: "knowledge transfer consulting", position: "5.8", ctr: "4.4%", impressions: "2,980" },
  { keyword: "symbiosis AI framework", position: "1.9", ctr: "9.2%", impressions: "1,760" },
  { keyword: "healthcare AI ecosystem", position: "8.4", ctr: "2.1%", impressions: "3,120" },
];

export const SOCIAL: SocialRow[] = [
  { channel: "LinkedIn", followers: "4,820", reach: "12.4K", engagement: "5.9%" },
  { channel: "Instagram", followers: "2,140", reach: "4.5K", engagement: "3.2%" },
];

export const IGOR_QUEUE: QueueItem[] = [
  { title: "Carousel — Symbiosis principle", meta: "Waiting · brief ready" },
  { title: "Proposal cover — AkzoNobel", meta: "In progress" },
  { title: "FOREWORD hero image", meta: "Waiting · needs copy" },
];

export const TASKS: TeamTask[] = [
  { who: "Matheus", task: "Enrich 8 new leads", status: "In progress", due: "Today" },
  { who: "Igor", task: "AkzoNobel proposal cover", status: "In progress", due: "Fri" },
  { who: "Ana", task: "Update recurring vendor list", status: "To do", due: "Wed" },
  { who: "Syed", task: "Fix booking sync error", status: "Blocked", due: "Today" },
];

export const AUTOMATIONS: Automation[] = [
  { name: "Invoice capture (Gmail scan)", state: "running", last: "08 min ago" },
  { name: "Booking sync (Sheet → Supabase)", state: "error", last: "3 h ago" },
  { name: "Weekly Pulse briefing", state: "running", last: "Mon 07:00" },
  { name: "GA4 daily digest", state: "running", last: "06:00" },
];

export const MEETINGS: Meeting[] = [
  { title: "Discovery — AkzoNobel", when: "Today · 14:30", who: "Camila, Matheus" },
  { title: "Intro — Philips Health", when: "Today · 11:00", who: "Matheus" },
  { title: "Weekly sync", when: "Tomorrow · 10:00", who: "Full team" },
];

export const DOCS: DocLink[] = [
  { title: "Commercial proposal template", meta: "Google Drive" },
  { title: "Brand guidelines", meta: "Google Drive" },
  { title: "ecosymb.[care] deck", meta: "Google Slides" },
  { title: "CLAUDE.md — Darwin context", meta: "Google Drive" },
];

export const CAPTURE_SAMPLES: CaptureSample[] = [
  { vendor: "Uber B.V.", invoice_no: "UB-88213", amount: "€ 42", currency: "EUR", invoice_date: "2026-07-22", due_date: "2026-07-22", category: "Travel", description: "Airport transfer — client meeting, Amsterdam.", confidence: "High" },
  { vendor: "Figma Inc.", invoice_no: "FIG-20451", amount: "€ 45", currency: "USD → EUR", invoice_date: "2026-07-20", due_date: "2026-08-04", category: "Software", description: "Design subscription — July 2026, 3 editor seats.", confidence: "High" },
  { vendor: "Zoom Video", invoice_no: "ZM-77410", amount: "€ 34", currency: "USD → EUR", invoice_date: "2026-07-18", due_date: "2026-08-02", category: "Software", description: "Zoom Pro subscription — monthly.", confidence: "Medium" },
];

export const ALERTS: AlertItem[] = [
  { title: "GenZone invoice — € 1,120 pending", subtitle: "Due in 3 days", color: C.amber, domain: "finance" },
  { title: "New website booking — Yusuf Kaya", subtitle: "Tomorrow · 15:30", color: C.greenDD, domain: "sales" },
  { title: "AkzoNobel lead has no next step", subtitle: "Stalled 4 days", color: C.brick, domain: "sales" },
  { title: "Booking-sync automation error", subtitle: "3 hours ago", color: C.brick, domain: "operations" },
];

export const AI_VISIBILITY: AiVisibilityRow[] = [
  { platform: "ChatGPT", pct: 72, query: '"AI-Native transformation partner" — cited' },
  { platform: "Claude", pct: 81, query: '"knowledge transfer AI consultancy" — referenced' },
  { platform: "Perplexity", pct: 64, query: '"symbiosis AI framework" — top source' },
  { platform: "Gemini", pct: 48, query: '"impact-org AI partner" — emerging' },
];

export const SALES_KPIS: KpiCard[] = [
  { label: "Weighted pipeline", value: "€ 182.4K", sub: ["Across 25 active leads"] },
  { label: "Active leads", value: "25", sub: ["7 added this week"] },
  { label: "Hot leads", value: "4", sub: ["Score 80+"] },
  { label: "Win rate", value: "31%", sub: ["Trailing 90 days"] },
];

export interface ReportDef {
  id: string;
  title: string;
  description: string;
}

export const REPORTS: ReportDef[] = [
  { id: "cashflow", title: "Cash flow summary", description: "Cash in vs. out across the fiscal year, by month." },
  { id: "runway", title: "Burn & runway", description: "Monthly burn rate and months of runway at current cash." },
  { id: "pnl", title: "Profit & loss (simplified)", description: "Income vs. expenses by category, with net margin." },
  { id: "expense", title: "Expense breakdown", description: "Every category ranked, with share of total spend." },
  { id: "forecast", title: "Pipeline forecast", description: "Weighted pipeline by month and expected close." },
  { id: "content", title: "Content performance", description: "SEO positions and publishing throughput." },
];

// Canned Darwin responses (executive tone, no emojis) — used as a fallback when
// ANTHROPIC_API_KEY is not configured, so Darwin is always demonstrable.
export const DARWIN_SAMPLES: Record<string, string> = {
  "Weekly Pulse":
    "WEEKLY PULSE — Monday briefing\n\nPipeline: € 182.4K weighted across 25 active leads; 4 hot (score 80+). AkzoNobel and Philips Health are this week's priority — both progressing without a scheduled next step.\n\nFinance: 3 payables pending (€ 4,750), none overdue. July spend € 3,924, in line with the trailing average.\n\nContent: 2 pieces in review, 1 with Igor for design, 10 published this month. SEO position improving on 3 of 4 tracked keywords.\n\nRecommended focus: convert the two stalled hot leads and clear the booking-sync automation error before it affects new bookings.",
  "Enrich Lead":
    "LEAD ENRICHMENT — Purney Ghatate, AkzoNobel\n\nRole: Head of Digital Operations. Signals: recent public commitment to supply-chain data integration; multiple disconnected tools referenced in a Q2 interview — a Digital-stage profile.\n\nMatched solution: symb.[aura] (smart BI with natural-language interpretation), with a path toward ecosymb integration.\n\nSuggested discovery questions:\n1. Where does fragmented data cost you the most decision time today?\n2. Which team would feel the fastest relief from a single source of truth?\n3. What has held back previous integration attempts?",
  "Prep Meeting":
    "MEETING PREP — AkzoNobel discovery (14:30)\n\nAttendees: Camila, Matheus. Objective: qualify integration scope and confirm decision timeline.\n\nAccount signals: Digital-stage organisation with fragmented tooling; public commitment to data integration this year.\n\nOpen with: the cost of fragmented decision-making, not the feature list. Close by agreeing a single next step and owner.",
  "Campaign Analysis":
    "CAMPAIGN ANALYSIS — Healthcare B (Maverick)\n\nResponse rate down 3% week-on-week. Step 2 of 6 shows the largest drop, suggesting the follow-up message is mistimed rather than mis-targeted.\n\nRecommendation: shorten the gap between step 1 and 2 from 4 days to 2, and lead with the single-source-of-truth outcome rather than the feature list. Hold sector and list constant to isolate the change.",
  "Content Gap":
    'CONTENT GAP — SEO opportunities\n\n"healthcare AI ecosystem" ranks 8.4 with 3,120 impressions — high demand, weak position. A dedicated pillar page could move it into the top 5.\n\n"symbiosis AI framework" already ranks 1.9 — protect it with an updated cornerstone and internal links from the two blog drafts in review.',
  "Generate Outreach":
    "OUTREACH DRAFT — Digital-stage manufacturer\n\nSubject: The decisions you lose between six tools\n\nMost scaling operations do not have a technology problem — they have an integration problem. Data lives in six places and no one sees the whole picture. We help AI-Native teams collapse that into a single source of truth.\n\nWorth a 20-minute diagnosis? I can show where fragmented data is costing you decision time.",
  "SEO Audit":
    "SEO AUDIT — this week\n\nTracked keywords: 4. Improving: 3 of 4. Best position: 1.9 (symbiosis AI framework).\n\nPriority: 'healthcare AI ecosystem' (pos 8.4, 3,120 impressions) is the largest untapped opportunity. AI-crawler visibility is strong on Claude (81%) and ChatGPT (72%); Gemini (48%) lags — add structured data to close the gap.",
  "Executive Summary":
    "EXECUTIVE SUMMARY\n\nLAYER 1 — SNAPSHOT\nPipeline € 182.4K weighted | 25 active leads | 4 MQLs (score 80+)\nBest channel: Ambassador — highest close weighting\nAlert: 2 hot leads stalled with no next step\nAction: convert AkzoNobel and Philips Health this week.\n\nLAYER 2 — CAMPAIGNS\nHealthcare B (Maverick): response rate down 3% w/w, concentrated at step 2 of 6.\nBest: LinkedIn authority sequence. Fix: Healthcare B timing.\n\nLAYER 3 — AGENCIES\nPresto — steady connections, low meeting conversion → REVIEW.\nMaverick — response dip this week → maintain, adjust cadence.\n\nLAYER 4 — SEO\nTop keyword: symbiosis AI framework (pos 1.9). Opportunity: healthcare AI ecosystem (pos 8.4, 3,120 impressions) — fix title/meta.\n\nLAYER 5 — PIPELINE\nNew 9 · Qualified 7 · Discovery 5 · Proposal 3 · Negotiation 1. Stagnant >14 days: 2.\n\nTOP 3 ACTIONS\n1. Prep + close AkzoNobel (owner: Matheus)\n2. Fix Healthcare B step-2 timing (owner: Matheus)\n3. Clear booking-sync automation error (owner: Syed)",
};

export const DARWIN_COMMANDS = [
  "Weekly Pulse",
  "Executive Summary",
  "Enrich Lead",
  "Prep Meeting",
  "Campaign Analysis",
  "Content Gap",
  "Generate Outreach",
  "SEO Audit",
];
