import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueueStatusBadge } from "./StatusBadge";
import { computeAge, timeSince } from "@/lib/utils";
import { genderLabel, t } from "@/i18n/ar";
import type { Patient } from "@/mock/types";

/** Responsive patient row — full row on desktop, stacked card on phone (§2.1). */
export function PatientRow({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/patients/${patient.fileNoBasma}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/patients/${patient.fileNoBasma}`)}
      className="flex cursor-pointer items-center gap-3 p-3.5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      {patient.tokenNumber != null && (
        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-center leading-none">
          <span className="text-[9px] text-muted-foreground">{t.common.token}</span>
          <span className="text-base font-bold text-foreground">{patient.tokenNumber}</span>
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" className="font-mono">
            <FileText className="size-3.5" />
            {patient.fileNoBasma}
          </Badge>
          <span className="font-bold text-foreground">
            {patient.firstName} {patient.familyName}
          </span>
          <span className="text-xs text-muted-foreground">
            {computeAge(patient.dob)} {t.common.years} · {genderLabel[patient.gender]}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {patient.diagnosis} · {patient.currentPhase}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <QueueStatusBadge status={patient.queueStatus} />
        {patient.waitingSince && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {timeSince(patient.waitingSince)}
          </span>
        )}
      </div>

      <ChevronLeft className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
    </Card>
  );
}
