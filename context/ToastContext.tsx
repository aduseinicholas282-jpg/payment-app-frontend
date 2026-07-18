"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const colors: Record<ToastType, { border: string; glow: string; dot: string }> = {
    success: { border: "border-teal/30", glow: "var(--teal-glow)", dot: "bg-teal" },
    error: { border: "border-error/30", glow: "var(--error-glow)", dot: "bg-error" },
    info: { border: "border-violet/30", glow: "var(--violet-glow)", dot: "bg-violet" },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              className={`glass-card ${c.border} rounded-xl px-4 py-3 flex items-center gap-3 animate-[toast-in_0.2s_ease-out]`}
              style={{ "--card-glow": c.glow } as React.CSSProperties}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 glow-dot ${c.dot}`} style={{ "--dot-glow": c.glow } as React.CSSProperties} />
              <p className="text-sm text-ink">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
