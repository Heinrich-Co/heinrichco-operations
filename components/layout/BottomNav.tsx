"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, TrendingUp, Wallet, Megaphone, Sparkles, LucideIcon } from "lucide-react";
import { useUI } from "@/components/AppProviders";
import { NAV, BOTTOM_NAV_IDS } from "@/lib/nav";

// Mobile bottom navigation bar with 5 icons.
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  sales: TrendingUp,
  finance: Wallet,
  marketing: Megaphone,
  darwin: Sparkles,
};

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUI();

  const items = BOTTOM_NAV_IDS.map((id) => NAV.find((n) => n.id === id)!).filter(
    (n) => (n.gate ? n.gate(user) : true)
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = ICONS[item.id] ?? Home;
        return (
          <button
            key={item.id}
            className={isActive(item.href) ? "active" : ""}
            onClick={() => router.push(item.href)}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <Icon size={20} />
            {item.label.split(" ")[0]}
          </button>
        );
      })}
    </nav>
  );
}
