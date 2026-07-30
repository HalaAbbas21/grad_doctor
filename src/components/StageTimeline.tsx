import { Check, Circle, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { phaseStatusLabel } from "@/i18n/ar";
import type { TreatmentPhase } from "@/mock/types";

/** Falls back to the raw value for a status outside the observed set — see the TODO(api-contract) on TreatmentPhase.status. */
function stageLabel(status: string): string {
  return phaseStatusLabel[status] ?? status;
}

const DOT: Record<string, string> = {
  completed: "bg-secondary text-secondary-foreground border-secondary",
  in_progress: "bg-primary text-primary-foreground border-primary",
  pending: "bg-muted text-muted-foreground border-border",
};

const LINE: Record<string, string> = {
  completed: "bg-secondary",
  in_progress: "bg-primary",
  pending: "bg-border",
};

/**
 * Horizontal RTL stage timeline (§6.4 / §6.9). Flows right→left; status by color + icon + label.
 * On phone it becomes a vertical list to avoid clipping. Keyed to the real
 * API's status spelling ("completed"/"in_progress"/"pending") — an
 * unrecognized status still renders (falls through to the neutral Circle
 * icon and undecorated border), just without a matching color/label.
 */
export function StageTimeline({ stages }: { stages: TreatmentPhase[] }) {
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
                ) : s.status === "in_progress" ? (
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
              <p className="text-xs text-muted-foreground">{stageLabel(s.status)}</p>
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
              ) : s.status === "in_progress" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Circle />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground">{s.stageName}</p>
              <p className="text-xs text-muted-foreground">
                {stageLabel(s.status)} · {formatDate(s.startDate)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
