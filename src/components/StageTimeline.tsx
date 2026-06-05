import { Check, Circle, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { stageStatusLabel } from "@/i18n/ar";
import type { TreatmentStage } from "@/mock/types";

const DOT: Record<TreatmentStage["status"], string> = {
  completed: "bg-secondary text-secondary-foreground border-secondary",
  "in-progress": "bg-primary text-primary-foreground border-primary",
  pending: "bg-muted text-muted-foreground border-border",
};

const LINE: Record<TreatmentStage["status"], string> = {
  completed: "bg-secondary",
  "in-progress": "bg-primary",
  pending: "bg-border",
};

/**
 * Horizontal RTL stage timeline (§6.4 / §6.9). Flows right→left; status by color + icon + label.
 * On phone it becomes a vertical list to avoid clipping.
 */
export function StageTimeline({ stages }: { stages: TreatmentStage[] }) {
  if (stages.length === 0) {
    return <p className="text-sm text-muted-foreground">لا توجد مراحل بعد.</p>;
  }
  return (
    <div className="w-full">
      {/* Desktop / tablet: horizontal */}
      <div className="hidden items-start sm:flex">
        {stages.map((s, i) => (
          <div key={s.id} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={cn("h-1 flex-1 rounded-full", i === 0 ? "bg-transparent" : LINE[s.status])} />
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 [&_svg]:size-4",
                  DOT[s.status]
                )}
              >
                {s.status === "completed" ? (
                  <Check />
                ) : s.status === "in-progress" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Circle />
                )}
              </div>
              <div
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i === stages.length - 1 ? "bg-transparent" : LINE[stages[i + 1].status]
                )}
              />
            </div>
            <div className="mt-2 px-1 text-center">
              <p className="text-sm font-bold text-foreground">{s.stageName}</p>
              <p className="text-xs text-muted-foreground">{stageStatusLabel[s.status]}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(s.startDate)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phone: vertical */}
      <ol className="relative space-y-4 sm:hidden">
        {stages.map((s) => (
          <li key={s.id} className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border-2 [&_svg]:size-4",
                DOT[s.status]
              )}
            >
              {s.status === "completed" ? (
                <Check />
              ) : s.status === "in-progress" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Circle />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground">{s.stageName}</p>
              <p className="text-xs text-muted-foreground">
                {stageStatusLabel[s.status]} · {formatDate(s.startDate)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
