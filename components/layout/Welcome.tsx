"use client";

import { useUI } from "@/components/AppProviders";

// Branded entry screen shown to first-time visitors (once per browser).
export default function Welcome() {
  const { entered, enter } = useUI();
  return (
    <div className={`welcome ${entered ? "hide" : ""}`} aria-hidden={entered}>
      <div className="welcome-inner">
        <div className="glyph" />
        <div className="w-mark">HEINRICH CO.</div>
        <div className="w-title">Operations</div>
        <div className="w-sub">Your company on one screen.</div>
        <button className="btn green w-enter" onClick={enter}>
          Enter workspace
        </button>
        <div className="w-foot">CONFIDENTIAL · INTERNAL USE ONLY</div>
      </div>
    </div>
  );
}
