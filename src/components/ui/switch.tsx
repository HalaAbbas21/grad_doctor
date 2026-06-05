import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/** Lightweight toggle switch (boolean inputs). RTL-aware via logical start/end. */
export function Switch({ checked, onCheckedChange, id, disabled, className }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-secondary" : "bg-muted",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-1 size-5 rounded-full bg-white shadow transition-all",
          // checked → thumb at the start (right in RTL); unchecked → at the end (left in RTL)
          checked ? "start-1" : "end-1"
        )}
      />
    </button>
  );
}
