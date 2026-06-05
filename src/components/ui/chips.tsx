import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** A single toggleable chip — used for multi-select inputs (minimal typing). */
export function Chip({ label, selected, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] min-h-[44px]",
        selected
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-card text-foreground hover:border-primary/40",
        className
      )}
    >
      {selected && <Check className="size-4" />}
      {label}
    </button>
  );
}

interface MultiChipSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}

export function MultiChipSelect({ options, selected, onToggle, className }: MultiChipSelectProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          selected={selected.includes(o.value)}
          onClick={() => onToggle(o.value)}
        />
      ))}
    </div>
  );
}
