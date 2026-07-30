"use client";

import { useUI } from "@/components/AppProviders";

// Bottom-right toast stack (black bg, green text, green left border).
export default function Toasts() {
  const { toasts } = useUI();
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
