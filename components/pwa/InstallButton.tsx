"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// "Install app" button — appears only when the browser offers installation
// (Chrome/Edge/Android). Self-hides once installed or if unsupported.
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  return (
    <button
      className="btn sm ghost"
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Download size={14} />
      Install app
    </button>
  );
}
