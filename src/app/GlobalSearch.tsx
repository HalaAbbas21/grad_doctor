import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, User } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { computeAge } from "@/lib/utils";
import { queueStatusLabel } from "@/i18n/ar";
import { t } from "@/i18n/ar";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** File-number-first command palette (§5). Matches file number, then name. */
export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const patients = useAppStore((s) => s.patients);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = q
    ? patients
        .map((p) => {
          const fileMatch = p.fileNoBasma.toLowerCase().includes(q) || p.fileNoBiruni.toLowerCase().includes(q);
          const nameMatch = `${p.firstName} ${p.familyName}`.toLowerCase().includes(q);
          return { p, score: fileMatch ? 0 : nameMatch ? 1 : 2 };
        })
        .filter((r) => r.score < 2)
        .sort((a, b) => a.score - b.score)
        .slice(0, 8)
        .map((r) => r.p)
    : patients.slice(0, 6);

  const go = (fileNo: string) => {
    onOpenChange(false);
    navigate(`/patients/${fileNo}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t.common.searchByFileNo} value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
        <CommandGroup heading={q ? "نتائج البحث" : "مرضى مؤخراً"}>
          {results.map((p) => (
            <CommandItem key={p.fileNoBasma} value={p.fileNoBasma} onSelect={() => go(p.fileNoBasma)}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <User className="size-4" />
              </span>
              <div className="flex flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <Badge variant="primary" className="font-mono">
                    <FileText className="size-3.5" /> {p.fileNoBasma}
                  </Badge>
                  <span className="font-bold">
                    {p.firstName} {p.familyName}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {computeAge(p.dob)} {t.common.years} · {p.diagnosis}
                </span>
              </div>
              <Badge variant="muted">{queueStatusLabel[p.queueStatus]}</Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
