import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type CountTone = "primary" | "highlight" | "accent" | "secondary";

const TONE: Record<CountTone, { bg: string; num: string; icon: string }> = {
  primary: { bg: "bg-primary-soft", num: "text-primary", icon: "bg-primary/10 text-primary" },
  highlight: {
    bg: "bg-highlight-soft",
    num: "text-highlight-foreground",
    icon: "bg-highlight/30 text-highlight-foreground",
  },
  accent: { bg: "bg-accent-soft", num: "text-accent", icon: "bg-accent/10 text-accent" },
  secondary: {
    bg: "bg-secondary-soft",
    num: "text-secondary-foreground",
    icon: "bg-secondary/15 text-secondary-foreground",
  },
};

interface CountCardProps {
  label: string;
  count: number;
  tone: CountTone;
  icon: React.ReactNode;
  onClick?: () => void;
  hero?: boolean;
}

/** Tappable priority-row count that deep-links to a filtered list (§6.2). */
export function CountCard({ label, count, tone, icon, onClick, hero }: CountCardProps) {
  const c = TONE[tone];
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-[112px] flex-col justify-between rounded-2xl border border-border/60 p-4 text-right shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        c.bg,
        hero && "ring-2 ring-highlight/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("flex size-10 items-center justify-center rounded-xl [&_svg]:size-5", c.icon)}>
          {icon}
        </span>
        <ChevronLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
      </div>
      <div>
        <div className={cn("font-display text-3xl font-bold leading-none", c.num)}>{count}</div>
        <div className="mt-1.5 text-sm font-bold text-foreground/80">{label}</div>
      </div>
    </button>
  );
}
