"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import Welcome from "./Welcome";
import Toasts from "@/components/shared/Toasts";
import ModalHost from "@/components/shared/ModalHost";
import LeadDrawer from "@/components/sales/LeadDrawer";

// Composes the persistent app chrome around the routed page content.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Welcome />
      <div className="app">
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar />
          <div className="content fade" key="content">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <LeadDrawer />
      <ModalHost />
      <Toasts />
    </>
  );
}
