"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/components/AppProviders";
import { visibleNav } from "@/lib/nav";
import { DEMO_USERS } from "@/lib/roles";

// Black sidebar with green accent on the active item. Doubles as a mobile
// slide-in drawer (see globals.css .rail.open).
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, roleKey, setRoleKey, sidebarOpen, setSidebarOpen } = useUI();
  const items = visibleNav(user);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const go = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div className="rail-ov" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside className={`rail ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo-lockup">
            <div className="logo-glyph" />
            <div>
              <div className="mark">HEINRICH CO.</div>
              <div className="sub">Operations</div>
            </div>
          </div>
        </div>
        <nav className="nav">
          {items.map((item) => (
            <button
              key={item.id}
              className={isActive(item.href) ? "active" : ""}
              onClick={() => go(item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="label-text">{item.label}</span>
              {item.soon && <span className="soon">SOON</span>}
            </button>
          ))}
        </nav>
        <div className="role">
          <label htmlFor="roleSel">Viewing as</label>
          <select
            id="roleSel"
            value={roleKey}
            onChange={(e) => setRoleKey(e.target.value)}
          >
            {DEMO_USERS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="hint">{user.focus}</div>
        </div>
      </aside>
    </>
  );
}
