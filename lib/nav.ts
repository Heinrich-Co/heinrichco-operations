import { DemoUser } from "./types";
import { canSeeFinance, canSeeSales } from "./roles";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  gate?: (u: DemoUser) => boolean;
  soon?: boolean;
}

export const NAV: NavItem[] = [
  { id: "home", label: "Command Center", href: "/" },
  { id: "approvals", label: "Approvals", href: "/approvals", gate: canSeeSales },
  { id: "sales", label: "Sales & Pipeline", href: "/sales", gate: canSeeSales },
  { id: "clients", label: "Clients", href: "/clients", gate: canSeeSales },
  { id: "finance", label: "Finance", href: "/finance", gate: canSeeFinance },
  { id: "marketing", label: "Marketing & Content", href: "/marketing" },
  { id: "operations", label: "Operations", href: "/operations" },
  { id: "reports", label: "Reports", href: "/reports" },
  { id: "darwin", label: "Darwin AI", href: "/darwin" },
];

export function visibleNav(user: DemoUser): NavItem[] {
  return NAV.filter((n) => (n.gate ? n.gate(user) : true));
}

// Icons for the mobile bottom bar are keyed by id in BottomNav.tsx.
export const BOTTOM_NAV_IDS = ["home", "sales", "finance", "marketing", "darwin"];
