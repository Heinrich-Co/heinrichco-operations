"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useUI } from "@/components/AppProviders";
import { NAV } from "@/lib/nav";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import InstallButton from "@/components/pwa/InstallButton";

function titleFor(pathname: string): string {
  if (pathname === "/") return "Command Center";
  const match = NAV.find((n) => n.href !== "/" && pathname.startsWith(n.href));
  return match ? match.label : "Command Center";
}

export default function Topbar() {
  const pathname = usePathname();
  const { user, setSidebarOpen } = useUI();
  const title = titleFor(pathname);

  return (
    <>
      {/* Mobile-only hamburger bar */}
      <div className="mobile-bar">
        <button
          className="hamburger"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          style={{ color: "var(--offwhite)" }}
        >
          <Menu size={22} />
        </button>
        <div className="mark" style={{ color: "var(--green)", fontSize: 11, letterSpacing: "0.2em", fontWeight: 600 }}>
          HEINRICH CO.
        </div>
        <div className="avatar">{user.initials}</div>
      </div>

      <header className="top">
        <div>
          <div className="eyebrow">{title}</div>
          <h1>{title}</h1>
        </div>
        <div className="top-right">
          <GlobalSearch />
          <InstallButton />
          <NotificationBell />
          <span className="proto-pill">Demo · sample data</span>
          <div className="who">
            <div className="n">{user.name}</div>
            <div className="r">{user.title}</div>
          </div>
          <div className="avatar">{user.initials}</div>
        </div>
      </header>
    </>
  );
}
