import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FlaskConical, Pencil, Send, Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { LabStatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { testLabel } from "@/mock";
import { t } from "@/i18n/ar";
import type { Patient } from "@/mock/types";

export function DoseApprovalScreen() {
  return (
    <PatientScreenFrame title={t.dose.title}>
      {(patient) => <DoseInner patient={patient} />}
    </PatientScreenFrame>
  );
}

function DoseInner({ patient }: { patient: Patient }) {
  const fileNo = patient.fileNoBasma;
  const navigate = useNavigate();
  const toast = useToast();
  const labRequests = useAppStore((s) => s.labRequests);
  const treatmentPlans = useAppStore((s) => s.treatmentPlans);
  const approveDose = useAppStore((s) => s.approveDose);

  const plan = treatmentPlans.find((p) => p.patientFileNo === fileNo);
  const activeStage = plan?.phases.find((s) => s.status === "in-progress") ?? plan?.phases[0];
  const recommended = activeStage?.medications[0];

  // Pre-dose lab tied to this patient.
  const preDoseLab = labRequests.find(
    (l) => l.patientFileNo === fileNo && l.tiedToDose && l.status === "results-available"
  );
  const labReviewed = Boolean(preDoseLab?.reviewed);

  const [modifying, setModifying] = useState(false);
  const [approvedDose, setApprovedDose] = useState(recommended ? `${recommended.dose}` : "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const send = () => {
    approveDose(fileNo);
    toast.success("تم إرسال الجرعة للممرضة", `${patient.firstName} · ${t.dose.sentStatus}`);
    navigate(`/patients/${fileNo}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 1. Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.dose.protocolStage}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{t.dose.protocolStage}</p>
            <p className="font-bold">{activeStage?.stageName ?? patient.currentPhase}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.dose.lastDose}</p>
            <p className="font-bold">{formatDate(activeStage?.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.dose.cycle}</p>
            <p className="font-bold">{activeStage?.cycles ?? 1}</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Pre-dose lab summary (the gate) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="size-4" /> {t.dose.preDoseLab}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!preDoseLab ? (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
              <AlertTriangle className="size-4" /> {t.dose.blocked}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold">{preDoseLab.testTypes.map(testLabel).join("، ")}</span>
                <div className="flex items-center gap-2">
                  <LabStatusBadge status={preDoseLab.status} />
                  {labReviewed ? (
                    <Badge variant="secondary">
                      <CheckCircle2 className="size-3.5" /> {t.labs.reviewed}
                    </Badge>
                  ) : (
                    <Badge variant="warning">{t.labs.notReviewed}</Badge>
                  )}
                </div>
              </div>
              {!labReviewed && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-warning/15 px-3 py-2">
                  <p className="text-sm font-bold text-warning-foreground">{t.dose.needsReview}</p>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${fileNo}/results`)}>
                    {t.labs.reviewResults}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Recommended dose */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.dose.recommended}</CardTitle>
        </CardHeader>
        <CardContent>
          {recommended ? (
            <div className="rounded-xl bg-primary-soft/60 p-4">
              <p className="text-lg font-bold text-primary">{recommended.name}</p>
              <p className="text-sm text-foreground">
                {recommended.dose} · {recommended.schedule}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد جرعة موصى بها في الخطة.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Decision */}
      {modifying && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.dose.modify}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dose">{t.dose.approvedDose}</Label>
              <Input id="dose" value={approvedDose} onChange={(e) => setApprovedDose(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">{t.dose.reason}</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t.common.notes}</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          disabled={!labReviewed}
          onClick={() => setConfirmOpen(true)}
        >
          <Syringe className="size-5" /> {t.dose.approve}
        </Button>
        <Button size="lg" variant="outline" className="flex-1" onClick={() => setModifying((m) => !m)}>
          <Pencil className="size-5" /> {t.dose.modify}
        </Button>
      </div>
      {!labReviewed && (
        <p className="text-center text-sm text-muted-foreground">{t.dose.needsReview}</p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.dose.sendToNurse}
        description={`${patient.firstName} ${patient.familyName} · ${patient.fileNoBasma}`}
        confirmLabel={t.dose.sendToNurse}
        onConfirm={send}
      >
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <Send className="size-4 text-primary" />
            {recommended?.name} · {modifying ? approvedDose : recommended?.dose}
          </p>
          {modifying && reason && <p className="mt-1 text-muted-foreground">{t.dose.reason}: {reason}</p>}
        </div>
      </ConfirmDialog>
    </div>
  );
}
