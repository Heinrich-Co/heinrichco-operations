// Shared domain types for the Heinrich Co. Operations app.

export type AppRole = "owner" | "admin" | "manager" | "member" | "viewer";

export interface DemoUser {
  key: string;
  name: string;
  title: string;
  initials: string;
  email: string;
  role: AppRole;
  focus: string;
}

export type LeadStage =
  | "New"
  | "Qualified"
  | "Discovery"
  | "Proposal"
  | "Negotiation"
  | "Closed-Won"
  | "Closed-Lost"
  | "Nurture";

export interface Lead {
  id: number;
  name: string;
  company: string;
  sector: string;
  stage: string;
  score: number;
  source: string;
  hot: boolean;
}

export interface Booking {
  name: string;
  when: string;
  service: string;
}

export interface Engagement {
  id: string;
  company: string;
  contact: string;
  sector: string;
  service: string;
  phase: string; // Discovery | Strategy | Validation | Implementation | Optimization | Complete
  owner: string;
  value: number;
  kt: string; // knowledge transfer: Not started | In progress | Complete
  nextMilestone: string;
  start: string;
}

export type PayableStatus = "pending" | "overdue" | "paid";

export interface Payable {
  id: string;
  vendor: string;
  category: string;
  amount: string;
  status: PayableStatus;
}

export interface Recurring {
  vendor: string;
  next: string;
  amount: string;
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface Deal {
  name: string;
  company: string;
  stage: string;
  value: number;
  source: string;
  month: string; // expected close YYYY-MM
}

export interface KanbanCard {
  title: string;
  meta: string;
}

export interface ContentItem {
  id: string;
  title: string;
  meta: string;
  status: string; // Draft | Approved | Design | Published
}

export interface SeoRow {
  keyword: string;
  position: string;
  ctr: string;
  impressions: string;
}

export interface SocialRow {
  channel: string;
  followers: string;
  reach: string;
  engagement: string;
}

export interface QueueItem {
  title: string;
  meta: string;
}

export interface TeamTask {
  who: string;
  task: string;
  status: string;
  due: string;
}

export interface Automation {
  name: string;
  state: "running" | "error" | "paused";
  last: string;
}

export interface Meeting {
  title: string;
  when: string;
  who: string;
}

export interface DocLink {
  title: string;
  meta: string;
}

export interface CaptureSample {
  vendor: string;
  invoice_no: string;
  amount: string;
  currency: string;
  invoice_date: string;
  due_date: string;
  category: string;
  description: string;
  confidence: string;
}

export interface AlertItem {
  title: string;
  subtitle: string;
  color: string;
  domain: string;
}

export interface AiVisibilityRow {
  platform: string;
  pct: number;
  query: string;
}

export interface KpiTrend {
  dir: "up" | "down" | "flat";
  label: string; // e.g. "8% vs last week"
  tone: "good" | "bad" | "neutral";
}

export interface KpiCard {
  label: string;
  value: string;
  sub: string[];
  trend?: KpiTrend;
}

export interface ExtractedInvoice {
  vendor: string;
  amount: string;
  currency: string;
  due_date: string;
  invoice_number: string;
  category?: string;
  description?: string;
  confidence?: string;
}
