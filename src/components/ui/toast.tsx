import * as React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertTriangle, Info, X, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "celebrate";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = counter++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Convenience hook: const toast = useToast(); toast.success("...") */
export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    success: (title: string, description?: string) => push({ title, description, variant: "success" }),
    error: (title: string, description?: string) => push({ title, description, variant: "error" }),
    info: (title: string, description?: string) => push({ title, description, variant: "info" }),
    celebrate: (title: string, description?: string) => push({ title, description, variant: "celebrate" }),
  };
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-secondary" />,
  error: <AlertTriangle className="size-5 text-destructive" />,
  info: <Info className="size-5 text-primary" />,
  celebrate: <PartyPopper className="size-5 text-highlight-foreground" />,
};

const ACCENT: Record<ToastVariant, string> = {
  success: "border-s-secondary",
  error: "border-s-destructive",
  info: "border-s-primary",
  celebrate: "border-s-highlight",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-start sm:px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-s-4 bg-card p-4 shadow-lg animate-in slide-in-from-bottom-2 fade-in",
            ACCENT[t.variant]
          )}
        >
          <div className="mt-0.5 shrink-0">{ICONS[t.variant]}</div>
          <div className="flex-1">
            <p className="font-bold leading-tight">{t.title}</p>
            {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
