import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, ChevronDown, Phone, FileText } from "lucide-react";
import { cn, computeAge } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LifeStatusBadge } from "./StatusBadge";
import { departmentLabel, genderLabel, t } from "@/i18n/ar";
import type { Patient } from "@/mock/types";

/**
 * Sticky patient-safety context bar shown on every patient-scoped screen (§4.7 / §6.4).
 * File number (Basma) is the primary, boldest identifier.
 */
export function PatientContextBar({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const phone = patient.phones.father ?? patient.phones.caregiver ?? patient.phones.mother;

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md md:top-16">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate("/patients")}
          aria-label={t.common.back}
        >
          <ArrowRight className="size-5" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Primary identity: file number */}
          <Badge variant="primary" className="shrink-0 px-3 py-1.5 font-mono text-sm">
            <FileText className="size-4" />
            {patient.fileNoBasma}
          </Badge>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-base font-bold text-foreground">
                {patient.firstName} {patient.familyName}
              </span>
              <span className="text-sm text-muted-foreground">
                · {computeAge(patient.dob)} {t.common.years} · {genderLabel[patient.gender]}
              </span>
              <LifeStatusBadge status={patient.lifeStatus} />
            </div>
            <div className="mt-0.5 hidden truncate text-sm text-muted-foreground sm:block">
              {patient.diagnosis} · {patient.currentPhase} · {departmentLabel[patient.department]}
            </div>
          </div>

          {/* Critical flags */}
          {patient.criticalFlags.length > 0 && (
            <Badge variant="destructive" className="hidden shrink-0 md:inline-flex">
              <AlertTriangle className="size-3.5" />
              {patient.criticalFlags[0]}
              {patient.criticalFlags.length > 1 && ` +${patient.criticalFlags.length - 1}`}
            </Badge>
          )}

          {phone && (
            <Button variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="size-4" />
                {t.patient.guardianContact}
              </a>
            </Button>
          )}

          {/* Mobile expand toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 sm:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="تفاصيل"
          >
            <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Mobile expandable details */}
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm sm:hidden">
          <p className="text-muted-foreground">
            {patient.diagnosis} · {patient.currentPhase} · {departmentLabel[patient.department]}
          </p>
          <p className="text-muted-foreground">
            {t.common.fileNoBiruni}: <span className="font-mono">{patient.fileNoBiruni}</span>
          </p>
          {patient.criticalFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {patient.criticalFlags.map((f) => (
                <Badge key={f} variant="destructive">
                  <AlertTriangle className="size-3.5" />
                  {f}
                </Badge>
              ))}
            </div>
          )}
          {phone && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="size-4" />
                {t.patient.guardianContact}
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
