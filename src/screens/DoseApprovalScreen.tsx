import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FlaskConical,
  Syringe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { Stepper } from "@/components/Stepper";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useLabRequests, useLabResults } from "@/hooks/useLabs";
import { usePrepareDoseApproval, useApproveDose } from "@/hooks/useDoseApprovals";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { t } from "@/i18n/ar";
import type { DoseApproval, Patient } from "@/mock/types";

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

  const {
    data: labRequests,
    isLoading: labsLoading,
    isError: labsError,
    refetch: refetchLabs,
  } = useLabRequests(fileNo);
  const { data: labResults } = useLabResults(fileNo);

  const prepareMutation = usePrepareDoseApproval();
  const approveMutation = useApproveDose();

  // Structural double-submit guards — checked synchronously, not just via a
  // disabled attribute that lags a render behind a click.
  const prepareInFlight = useRef(false);
  const approveInFlight = useRef(false);

  const [step, setStep] = useState<0 | 1>(0);
  const [selectedLabId, setSelectedLabId] = useState("");
  const [prepareConfirmOpen, setPrepareConfirmOpen] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [preparedApproval, setPreparedApproval] = useState<DoseApproval | null>(null);

  const [approvedDose, setApprovedDose] = useState("");
  const [route, setRoute] = useState("");
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [finalApproval, setFinalApproval] = useState<DoseApproval | null>(null);

  if (labsLoading) return <ListSkeleton rows={3} />;
  if (labsError) return <ErrorState onRetry={() => refetchLabs()} />;

  // Step 1 gate: only reviewed lab requests may justify a dose — no bypass.
  const eligibleLabs = (labRequests ?? []).filter((l) => l.reviewed);
  const selectedLab = eligibleLabs.find((l) => l.id === selectedLabId);
  const resultsFor = (requestId: string) => (labResults ?? []).filter((r) => r.requestId === requestId);

  const openPrepareConfirm = () => {
    if (!selectedLabId) return;
    setPrepareError(null);
    setPrepareConfirmOpen(true);
  };

  const confirmPrepare = () => {
    if (prepareInFlight.current) return;
    prepareInFlight.current = true;
    prepareMutation.mutate(
      { patientFileNo: fileNo, labTestRequestId: selectedLabId },
      {
        onSuccess: (record) => {
          prepareInFlight.current = false;
          setPreparedApproval(record);
          setApprovedDose(record.recommendedDose ?? "");
          setPrepareConfirmOpen(false);
          setStep(1);
        },
        onError: (err) => {
          prepareInFlight.current = false;
          setPrepareConfirmOpen(false);
          setPrepareError(err.message);
        },
      }
    );
  };

  const confirmApprove = () => {
    if (approveInFlight.current || !preparedApproval) return;
    approveInFlight.current = true;
    approveMutation.mutate(
      { id: preparedApproval.id, payload: { approvedDose, route } },
      {
        onSuccess: (record) => {
          approveInFlight.current = false;
          setApproveConfirmOpen(false);
          setFinalApproval(record);
          toast.celebrate(t.dose.approvedStatus, `${patient.firstName} · ${t.dose.readyForNurse}`);
        },
        onError: (err) => {
          approveInFlight.current = false;
          setApproveConfirmOpen(false);
          setApproveError(err.message);
        },
      }
    );
  };

  const recommendedDose = preparedApproval?.recommendedDose ?? null;
  const doseWasAdjusted = recommendedDose != null && approvedDose.trim() !== "" && approvedDose !== recommendedDose;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Stepper steps={[t.dose.prepareStep, t.dose.approveStep]} current={step} />

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
                <>
                  <EmptyState
                    title={t.dose.noEligibleLab}
                    description="لا يمكن المتابعة قبل توفّر نتيجة تحليل مُراجَعة لهذا المريض."
                    icon={<AlertTriangle className="size-7" />}
                  />
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => navigate(`/patients/${fileNo}`)}>
                      <FlaskConical className="size-4" /> {t.patient.labs}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {eligibleLabs.map((l) => {
                    const selected = l.id === selectedLabId;
                    const reqResults = resultsFor(l.id);
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
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                              selected ? "border-primary bg-primary" : "border-input"
                            )}
                          >
                            {selected && <Check className="size-3.5 text-primary-foreground" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {l.testTypes.map((tt) => (
                                <Badge key={tt} variant="accent">
                                  {tt}
                                </Badge>
                              ))}
                            </div>
                            {reqResults.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {reqResults.map((r) => (
                                  <p key={r.id} className="text-sm text-muted-foreground">
                                    {r.summary && <span className="text-foreground">{r.summary}</span>}
                                    <span className="block text-xs">
                                      {t.common.date}: {formatDate(r.resultDate)}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-muted-foreground">
                                {t.common.date}: {formatDate(l.requestDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {prepareError && (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
              <AlertTriangle className="size-4 shrink-0" /> {prepareError}
            </p>
          )}

          {eligibleLabs.length > 0 && (
            <Button size="lg" className="w-full" disabled={!selectedLabId} onClick={openPrepareConfirm}>
              {t.common.next}
            </Button>
          )}
        </>
      )}

      {step === 1 && preparedApproval && !finalApproval && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.dose.context}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t.common.fileNo}</p>
                <p className="font-bold">
                  {patient.firstName} {patient.familyName} · {patient.fileNoBasma}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.dose.preDoseLab}</p>
                <p className="font-bold">{selectedLab ? selectedLab.testTypes.join("، ") : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.common.date}</p>
                <p className="font-bold">{formatDate(selectedLab?.requestDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.dose.cycle}</p>
                <p className="font-bold">{preparedApproval.cycle}</p>
              </div>
              {preparedApproval.stageRef && (
                <div>
                  <p className="text-xs text-muted-foreground">{t.dose.protocolStage}</p>
                  <p className="font-bold">{preparedApproval.stageRef}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.dose.recommended}</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedDose ? (
                <>
                  <div className="rounded-xl bg-primary-soft/60 p-4">
                    <p className="text-lg font-bold text-primary">{recommendedDose}</p>
                  </div>
                  {doseWasAdjusted && (
                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-warning-foreground">
                      <AlertTriangle className="size-4 shrink-0" /> {t.dose.adjustedFromRecommended}
                    </p>
                  )}
                </>
              ) : (
                <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">{t.dose.noRecommendation}</p>
              )}
            </CardContent>
          </Card>

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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={!approvedDose.trim() || !route.trim() || approveMutation.isPending}
              onClick={() => setApproveConfirmOpen(true)}
            >
              <Syringe className="size-5" /> {t.dose.approveStep}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setStep(0)} disabled={approveMutation.isPending}>
              <ArrowRight className="size-5" /> {t.common.back}
            </Button>
          </div>
        </>
      )}

      {finalApproval && (
        <Card className="border-secondary/40 bg-secondary-soft/40">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
              <CheckCircle2 className="size-9" />
            </span>
            <p className="text-xl font-bold">{t.dose.approvedStatus}</p>
            <p className="text-muted-foreground">
              {finalApproval.approvedDose} · {formatDateTime(finalApproval.approvedAt)}
            </p>
            <Badge variant="secondary" className="text-sm">
              {t.dose.readyForNurse} {finalApproval.marItemId ? `(MAR #${finalApproval.marItemId})` : ""}
            </Badge>
            <Button className="mt-2" onClick={() => navigate(`/patients/${fileNo}`)}>
              {t.patient.record}
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={prepareConfirmOpen}
        onOpenChange={(open) => !open && setPrepareConfirmOpen(false)}
        title={t.dose.prepareStep}
        description={selectedLab ? selectedLab.testTypes.join("، ") : undefined}
        confirmLabel={t.common.next}
        loading={prepareMutation.isPending}
        onConfirm={confirmPrepare}
      />

      <ConfirmDialog
        open={approveConfirmOpen}
        onOpenChange={(open) => !open && setApproveConfirmOpen(false)}
        title={t.dose.approveStep}
        confirmLabel={t.dose.approveStep}
        loading={approveMutation.isPending}
        onConfirm={confirmApprove}
      >
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <Syringe className="size-4 text-primary" />
            {approvedDose} · {route || "—"}
          </p>
          <Badge variant="muted" className="mt-2">
            {patient.firstName} {patient.familyName} · {patient.fileNoBasma}
          </Badge>
        </div>
      </ConfirmDialog>
    </div>
  );
}
