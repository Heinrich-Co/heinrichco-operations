"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/components/AppProviders";
import { LEADS, PAYABLES, KANBAN } from "@/lib/data";

interface Result {
  title: string;
  meta: string;
  act: "lead" | "go";
  arg: string;
}
interface Group {
  group: string;
  items: Result[];
}

// Search across leads, invoices, and content from the top bar.
export default function GlobalSearch() {
  const router = useRouter();
  const { openLead } = useUI();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
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

  const query = q.trim().toLowerCase();
  const groups: Group[] = [];
  if (query) {
    const leads = LEADS.filter((l) =>
      `${l.name} ${l.company} ${l.sector}`.toLowerCase().includes(query)
    ).slice(0, 4);
    if (leads.length)
      groups.push({
        group: "Leads",
        items: leads.map((l) => ({
          title: l.name,
          meta: `${l.company} · score ${l.score}`,
          act: "lead",
          arg: String(l.id),
        })),
      });

    const inv = PAYABLES.filter((p) =>
      `${p.vendor} ${p.category}`.toLowerCase().includes(query)
    ).slice(0, 4);
    if (inv.length)
      groups.push({
        group: "Invoices",
        items: inv.map((p) => ({
          title: p.vendor,
          meta: `${p.category} · ${p.amount} · ${p.status}`,
          act: "go",
          arg: "/finance",
        })),
      });

    const content: Result[] = [];
    Object.keys(KANBAN).forEach((col) => {
      KANBAN[col].forEach((c) => {
        if (c.title.toLowerCase().includes(query))
          content.push({
            title: c.title,
            meta: `${col} · ${c.meta}`,
            act: "go",
            arg: "/marketing",
          });
      });
    });
    if (content.length) groups.push({ group: "Content", items: content.slice(0, 4) });
  }

  const pick = (r: Result) => {
    setOpen(false);
    setQ("");
    if (r.act === "lead") {
      router.push("/sales");
      openLead(parseInt(r.arg, 10));
    } else {
      router.push(r.arg);
    }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-in">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={q}
          placeholder="Search leads, invoices, content…"
          autoComplete="off"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (q) setOpen(true);
          }}
        />
      </div>
      {open && query && (
        <div className="search-res" onClick={(e) => e.stopPropagation()}>
          {groups.length === 0 ? (
            <div className="empty">No matches for &ldquo;{q}&rdquo;</div>
          ) : (
            groups.map((gr) => (
              <div key={gr.group}>
                <div className="sg">{gr.group}</div>
                {gr.items.map((it, i) => (
                  <button className="sr" key={i} onClick={() => pick(it)}>
                    {it.title}
                    <div className="m">{it.meta}</div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
