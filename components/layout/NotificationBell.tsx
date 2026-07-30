"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUI } from "@/components/AppProviders";
import { ALERTS } from "@/lib/data";
import { subscribeToPush } from "@/lib/push-client";

// Bell with unread badge; panel navigates to the relevant domain on tap.
export default function NotificationBell() {
  const router = useRouter();
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const unread = Math.max(0, ALERTS.length - readCount);

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        className="iconbtn"
        aria-label="Notifications"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          setReadCount(ALERTS.length);
        }}
      >
        <Bell size={20} strokeWidth={1.6} />
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
          <div className="nh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Notifications</span>
            <button
              className="notif-enable"
              onClick={async () => {
                const r = await subscribeToPush();
                toast(r.ok ? "Push alerts enabled on this device" : r.reason);
              }}
            >
              Enable push
            </button>
          </div>
          {ALERTS.map((a, i) => (
            <button
              className="ni"
              key={i}
              onClick={() => {
                setOpen(false);
                router.push(a.domain === "home" ? "/" : `/${a.domain}`);
                toast("Opened: " + a.title);
              }}
            >
              <span className="nd" style={{ background: a.color }} />
              <div>
                <div className="t">{a.title}</div>
                <div className="s">{a.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
