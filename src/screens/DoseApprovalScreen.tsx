import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  FlaskConical,
  Syringe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/states";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { Stepper } from "@/components/Stepper";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { cn, delay, formatDate } from "@/lib/utils";
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
  const doseApprovals = useAppStore((s) => s.doseApprovals);
  const createDoseApproval = useAppStore((s) => s.createDoseApproval);
  const approveDoseApproval = useAppStore((s) => s.approveDoseApproval);
  const simulateApprovalError = useAppStore((s) => s.simulateApprovalError);
  const setSimulateApprovalError = useAppStore((s) => s.setSimulateApprovalError);

  const plan = treatmentPlans.find((p) => p.patientFileNo === fileNo);
  const activeStage = plan?.phases.find((s) => s.status === "in-progress") ?? plan?.phases[0];
  const recommended = activeStage?.medications[0];

  // Step 1 gate: only reviewed lab requests with a result may justify a dose.
  const eligibleLabs = labRequests.filter(
    (l) => l.patientFileNo === fileNo && l.reviewed && l.status === "results-available"
  );

  const priorApproved = doseApprovals.filter((d) => d.patientFileNo === fileNo && d.status === "approved");
  const existingPrepared = doseApprovals.find((d) => d.patientFileNo === fileNo && d.status === "prepared");

  const [step, setStep] = useState(existingPrepared ? 1 : 0);
  const [selectedLabId, setSelectedLabId] = useState(existingPrepared?.labTestRequestId ?? "");
  const [activeDoseApprovalId, setActiveDoseApprovalId] = useState(existingPrepared?.id ?? "");
  const [preparing, setPreparing] = useState(false);

  const [approvedDose, setApprovedDose] = useState(recommended?.dose ?? "");
  const [route, setRoute] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const activeDoseApproval = doseApprovals.find((d) => d.id === activeDoseApprovalId);
  const contextLab = labRequests.find((l) => l.id === activeDoseApproval?.labTestRequestId);

  const goToStep2 = async () => {
    if (!selectedLabId || preparing) return;
    setPreparing(true);
    await delay(500); // POST /dose-approvals
    const record = createDoseApproval(fileNo, selectedLabId);
    setActiveDoseApprovalId(record.id);
    setPreparing(false);
    setStep(1);
  };

  const confirmApprove = async () => {
    if (submitting || !activeDoseApprovalId) return;
    setSubmitting(true);
    setApproveError(null);
    await delay(700); // PATCH /dose-approvals/{id}/approve — no optimistic update before this resolves
    if (simulateApprovalError) {
      setSubmitting(false);
      setConfirmOpen(false);
      setApproveError("تعذّر إقرار الجرعة. حدث خطأ في الاتصال بالخادم. لم يتم تسجيل أي إقرار — حاول مرة أخرى.");
      return;
    }
    // TODO(api-contract): the approve request only carries approved_dose + route;
    // medName is inferred here from the treatment plan since the contract doesn't
    // say how the MAR item's medication name is populated server-side.
    approveDoseApproval(activeDoseApprovalId, {
      approvedDose,
      route,
      medName: recommended?.name ?? "",
    });
    setSubmitting(false);
    setConfirmOpen(false);
    toast.success(t.dose.approvedStatus, `${patient.firstName} · ${t.dose.readyForNurse}`);
    navigate(`/patients/${fileNo}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Stepper steps={[t.dose.prepareStep, t.dose.approveStep]} current={step} />

      {priorApproved.length > 0 && (
        <Card className="border-secondary/40 bg-secondary-soft/40">
          <CardContent className="space-y-2 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-secondary-foreground">
              <CheckCircle2 className="size-4" /> جرعات مُقرّة سابقاً لهذا المريض
            </p>
            {priorApproved.map((d) => (
              <p key={d.id} className="text-xs text-muted-foreground">
                {d.approvedDose} · {d.route} · {formatDate(d.approvedAt)} · {t.dose.readyForNurse}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4" /> {t.dose.selectReviewedLab}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eligibleLabs.length === 0 ? (
                <EmptyState
                  title={t.dose.noEligibleLab}
                  description="لا يمكن المتابعة قبل توفّر نتيجة تحليل مُراجَعة لهذا المريض."
                  icon={<AlertTriangle className="size-7" />}
                />
              ) : (
                <div className="space-y-3">
                  {eligibleLabs.map((l) => {
                    const selected = l.id === selectedLabId;
                    return (
                      <Card
                        key={l.id}
                        role="radio"
                        aria-checked={selected}
                        tabIndex={0}
                        onClick={() => setSelectedLabId(l.id)}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedLabId(l.id)}
                        className={cn(
                          "cursor-pointer p-4 transition-all hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                          selected && "border-primary ring-2 ring-primary/30"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                                selected ? "border-primary bg-primary" : "border-input"
                              )}
                            >
                              {selected && <Check className="size-3.5 text-primary-foreground" />}
                            </span>
                            <div>
                              <p className="font-bold">{l.testTypes.map(testLabel).join("، ")}</p>
                              <p className="text-xs text-muted-foreground">
                                {t.common.date}: {formatDate(l.resultUploadDate)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patients/${fileNo}/results`);
                            }}
                          >
                            <FileText className="size-4" /> {t.labs.pdfView}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
              {eligibleLabs.length === 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => navigate(`/patients/${fileNo}/results`)}>
                    <FlaskConical className="size-4" /> {t.labs.reviewResults}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            disabled={!selectedLabId || preparing}
            onClick={goToStep2}
          >
            {preparing ? t.common.loading : t.common.next}
          </Button>
        </>
      )}

      {step === 1 && activeDoseApproval && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.dose.context}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t.dose.protocolStage}</p>
                <p className="font-bold">{activeStage?.stageName ?? patient.currentPhase}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.dose.preDoseLab}</p>
                <p className="font-bold">{contextLab ? contextLab.testTypes.map(testLabel).join("، ") : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.common.date}</p>
                <p className="font-bold">{formatDate(contextLab?.resultUploadDate)}</p>
              </div>
            </CardContent>
          </Card>

          {recommended && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.dose.recommended}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-primary-soft/60 p-4">
                  <p className="text-lg font-bold text-primary">{recommended.name}</p>
                  <p className="text-sm text-foreground">
                    {recommended.dose} · {recommended.schedule}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.dose.approveStep}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dose">{t.dose.approvedDose}</Label>
                <Input id="dose" value={approvedDose} onChange={(e) => setApprovedDose(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">{t.dose.route}</Label>
                <Input id="route" placeholder="IV" value={route} onChange={(e) => setRoute(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {approveError && (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
              <AlertTriangle className="size-4 shrink-0" /> {approveError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 rounded-lg border border-dashed border-border bg-card/60 px-4 py-2.5">
            <Label htmlFor="failApproval" className="text-muted-foreground">
              {t.dose.failApprovalToggle}
            </Label>
            <Switch id="failApproval" checked={simulateApprovalError} onCheckedChange={setSimulateApprovalError} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={!approvedDose.trim() || !route.trim()}
              onClick={() => setConfirmOpen(true)}
            >
              <Syringe className="size-5" /> {t.dose.approveStep}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setStep(0)}>
              <ArrowRight className="size-5" /> {t.common.back}
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.dose.approveStep}
        description={`${patient.firstName} ${patient.familyName} · ${patient.fileNoBasma}`}
        confirmLabel={t.dose.approveStep}
        loading={submitting}
        onConfirm={confirmApprove}
      >
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <Syringe className="size-4 text-primary" />
            {recommended?.name} · {approvedDose} · {route || "—"}
          </p>
          <Badge variant="muted" className="mt-2">
            {patient.fileNoBasma}
          </Badge>
        </div>
      </ConfirmDialog>
    </div>
  );
}
