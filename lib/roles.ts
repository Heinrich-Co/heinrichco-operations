import { DemoUser } from "./types";

// Demo roster mirrors the prototype's "Viewing as" switcher. In production these
// map onto the Supabase `users` table (email + role). The Finance domain is
// gated to owners (Camila) plus Syed, matching the RLS policy in schema.sql.
export const DEMO_USERS: DemoUser[] = [
  {
    key: "camila",
    name: "Camila Heinrich",
    title: "Founder & CEO",
    initials: "CH",
    email: "camila@heinrichco-ai.com",
    role: "owner",
    focus: "Strategic overview — decisions, approvals, and forecast.",
  },
  {
    key: "matheus",
    name: "Matheus Silva",
    title: "Sales & Growth",
    initials: "MS",
    email: "matheus@heinrichco-ai.com",
    role: "manager",
    focus: "Pipeline management, lead enrichment, and agency coordination.",
  },
  {
    key: "igor",
    name: "Igor Kretteis",
    title: "Design & Brand",
    initials: "IK",
    email: "igor@heinrichco-ai.com",
    role: "member",
    focus: "Design queue, content to visualize, and brand assets.",
  },
  {
    key: "ana",
    name: "Ana Ribeiro",
    title: "Operations",
    initials: "AR",
    email: "ana@heinrichco-ai.com",
    role: "manager",
    focus: "Operations, task tracking, and process documentation.",
  },
  {
    key: "syed",
    name: "Syed",
    title: "Systems & Automation",
    initials: "SY",
    email: "syed@heinrichco-ai.com",
    role: "admin",
    focus: "Automation health, data quality, and system status.",
  },
];

export const FINANCE_EMAILS = ["syed@heinrichco-ai.com"];

// Finance is visible to owners, or the explicitly whitelisted finance email —
// mirrors the `finance_owner_only` RLS policy.
export function canSeeFinance(user: DemoUser): boolean {
  return user.role === "owner" || FINANCE_EMAILS.includes(user.email);
}

// Sales/leads access: owner, admin, manager (mirrors `leads_access` policy).
export function canSeeSales(user: DemoUser): boolean {
  return ["owner", "admin", "manager"].includes(user.role);
}

export function getUser(key: string): DemoUser {
  return DEMO_USERS.find((u) => u.key === key) ?? DEMO_USERS[0];
}
