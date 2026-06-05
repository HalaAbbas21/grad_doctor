import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiChipSelect } from "@/components/ui/chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TemplateAnswer, TemplateQuestion } from "@/mock/types";
import { t } from "@/i18n/ar";

interface DynamicFieldProps {
  question: TemplateQuestion;
  value: TemplateAnswer;
  onChange: (value: TemplateAnswer) => void;
  invalid?: boolean;
}

/** Renders one template question by its inputType (§6.5 dynamic renderer). */
export function DynamicField({ question, value, onChange, invalid }: DynamicFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={question.id}>{question.label}</Label>
        {question.required ? (
          <Badge variant="warning" className="px-2 py-0 text-[10px]">
            {t.common.required}
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">({t.common.optional})</span>
        )}
      </div>
      {question.helpText && <p className="text-xs text-muted-foreground">{question.helpText}</p>}

      {question.inputType === "text" && (
        <Textarea
          id={question.id}
          value={(value as string) ?? ""}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={invalid ? "border-destructive" : ""}
        />
      )}

      {question.inputType === "number" && (
        <div className="flex items-center gap-2">
          <Input
            id={question.id}
            type="number"
            inputMode="decimal"
            value={value === null || value === undefined ? "" : (value as number)}
            placeholder={question.placeholder}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={invalid ? "border-destructive" : ""}
          />
          {question.unit && <span className="shrink-0 text-sm text-muted-foreground">{question.unit}</span>}
        </div>
      )}

      {question.inputType === "date" && (
        <Input
          id={question.id}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={invalid ? "border-destructive" : ""}
        />
      )}

      {question.inputType === "boolean" && (
        <div className="flex items-center gap-3 rounded-lg border border-input bg-card px-4 py-2.5">
          <Switch
            id={question.id}
            checked={Boolean(value)}
            onCheckedChange={(c) => onChange(c)}
          />
          <span className="text-sm text-muted-foreground">{value ? "نعم" : "لا"}</span>
        </div>
      )}

      {question.inputType === "select" && (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={question.id} className={invalid ? "border-destructive" : ""}>
            <SelectValue placeholder="اختر…" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.inputType === "multi-select" && (
        <MultiChipSelect
          options={question.options ?? []}
          selected={Array.isArray(value) ? (value as string[]) : []}
          onToggle={(v) => {
            const cur = Array.isArray(value) ? (value as string[]) : [];
            onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
          }}
        />
      )}
    </div>
  );
}
