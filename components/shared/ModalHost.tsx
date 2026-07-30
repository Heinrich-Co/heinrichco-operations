"use client";

import { useEffect } from "react";
import { useUI } from "@/components/AppProviders";

// Renders the currently-open modal from UI context.
export default function ModalHost() {
  const { modal, closeModal } = useUI();

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  if (!modal) return null;

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={modal.title}>
        <div className="mh">
          <div className="k">{modal.kicker}</div>
          <h3>{modal.title}</h3>
        </div>
        <div className="mb">{modal.body}</div>
        <div className="mf">
          <button className="btn ghost" onClick={closeModal}>
            Close
          </button>
          <button className="btn" onClick={closeModal}>
            Looks good
          </button>
        </div>
      </div>
    </div>
  );
}
