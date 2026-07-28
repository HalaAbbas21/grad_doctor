import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departmentLabel, genderLabel, t } from "@/i18n/ar";
import { formatDate } from "@/lib/utils";
import type { PatientListItem } from "@/mock/types";

/**
 * Row for the real GET /patients list — deliberately shows only fields that
 * endpoint returns (no diagnosis/phase/queue status: those are mock-only /
 * belong to the not-yet-migrated detail endpoint). Same card/badge/spacing
 * language as the mock `PatientRow`, which still renders `Patient` elsewhere.
 */
export function PatientListRow({ patient }: { patient: PatientListItem }) {
  const navigate = useNavigate();
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/patients/${patient.fileNoBasma}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/patients/${patient.fileNoBasma}`)}
      className="flex cursor-pointer items-center gap-3 p-3.5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" className="font-mono">
            <FileText className="size-3.5" />
            {patient.fileNoBasma}
          </Badge>
          <span className="font-bold text-foreground">{patient.fullName}</span>
          <span className="text-xs text-muted-foreground">
            {patient.age != null ? `${patient.age} ${t.common.years}` : "—"}
            {" · "}
            {patient.gender ? genderLabel[patient.gender] : "—"}
          </span>
          {patient.registrationStatus === "partial" && (
            <Badge variant="warning">{t.patient.partialRegistration}</Badge>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {patient.department ? departmentLabel[patient.department] : "—"} ·{" "}
          {formatDate(patient.registrationDate)}
        </p>
      </div>

      <ChevronLeft className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
    </Card>
  );
}
