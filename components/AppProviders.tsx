"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { DemoUser } from "@/lib/types";
import { DEMO_USERS, getUser } from "@/lib/roles";

interface ToastItem {
  id: number;
  msg: string;
}

interface ModalContent {
  kicker: string;
  title: string;
  body: ReactNode;
}

interface UIState {
  user: DemoUser;
  roleKey: string;
  setRoleKey: (key: string) => void;

  toast: (msg: string) => void;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;

  modal: ModalContent | null;
  showModal: (m: ModalContent) => void;
  closeModal: () => void;

  leadId: number | null;
  openLead: (id: number) => void;
  closeLead: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  entered: boolean;
  enter: () => void;
}

const Ctx = createContext<UIState | null>(null);

export function useUI(): UIState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI must be used within AppProviders");
  return v;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  const [roleKey, setRoleKeyState] = useState<string>(DEMO_USERS[0].key);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entered, setEntered] = useState(true);

  // First-time visitors see the branded welcome screen (once per browser).
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem("hco_entered");
      if (!seen) setEntered(false);
    } catch {
      /* localStorage unavailable — skip welcome */
    }
    try {
      const savedRole = window.localStorage.getItem("hco_role");
      if (savedRole && DEMO_USERS.some((u) => u.key === savedRole)) {
        setRoleKeyState(savedRole);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setRoleKey = useCallback((key: string) => {
    setRoleKeyState(key);
    try {
      window.localStorage.setItem("hco_role", key);
    } catch {
      /* ignore */
    }
  }, []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.floor(performance.now());
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const enter = useCallback(() => {
    setEntered(true);
    try {
      window.localStorage.setItem("hco_entered", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<UIState>(
    () => ({
      user: getUser(roleKey),
      roleKey,
      setRoleKey,
      toast,
      toasts,
      dismissToast,
      modal,
      showModal: setModal,
      closeModal: () => setModal(null),
      leadId,
      openLead: setLeadId,
      closeLead: () => setLeadId(null),
      sidebarOpen,
      setSidebarOpen,
      entered,
      enter,
    }),
    [roleKey, setRoleKey, toast, toasts, dismissToast, modal, leadId, sidebarOpen, entered, enter]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
