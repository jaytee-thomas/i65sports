"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "error";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastRecord = ToastOptions & { id: string };

type ToastContextValue = {
  pushToast: (toast: ToastOptions) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: ToastOptions) => {
      const id = generateId();
      const record: ToastRecord = {
        ...toast,
        variant: toast.variant ?? "default",
        id,
      };
      setToasts((prev) => [...prev, record]);

      const duration = toast.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }

      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
    }),
    [pushToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end gap-3 px-4 py-6 sm:p-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-lg transition",
              toast.variant === "success" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
              toast.variant === "error" && "border-red-600/60 bg-red-900/30 text-red-100",
              toast.variant === "default" && "border-ash/60 bg-graphite/80 text-neutral-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs text-neutral-300">{toast.description}</p>
                ) : null}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-xs uppercase tracking-[0.28em] text-neutral-400 transition hover:text-neutral-100"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
