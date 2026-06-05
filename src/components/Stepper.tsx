import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { t } from "@/i18n/ar";

interface StepperProps {
  steps: string[];
  current: number; // 0-based
}

/** "الخطوة X من Y" header with progress + dotted labels (§4.3). */
export function Stepper({ steps, current }: StepperProps) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-primary">
          {t.common.step} {current + 1} {t.common.of} {steps.length}
        </span>
        <span className="text-muted-foreground">{steps[current]}</span>
      </div>
      <Progress value={pct} indicatorClassName="bg-primary" />
      <div className="hidden flex-wrap gap-2 sm:flex">
        {steps.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition-colors",
              i === current
                ? "bg-primary text-primary-foreground"
                : i < current
                  ? "bg-secondary-soft text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>
    </div>
  );
}
