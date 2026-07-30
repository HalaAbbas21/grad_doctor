import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Circle,
  ClipboardEdit,
  FileCheck2,
  FilePlus2,
  FileText,
  FlaskConical,
  Loader2,
  MapPinned,
  Send,
  Syringe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PatientContextBar } from "@/components/PatientContextBar";
import { ConsultTypeBadge } from "@/components/consult-type-badge";
import { ConsultStatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { usePatient } from "@/hooks/usePatient";
import { useClinicalNotes, useCreateClinicalNote } from "@/hooks/useClinicalNotes";
import { useTreatmentPlans } from "@/hooks/useTreatmentPlans";
import { useVitals } from "@/hooks/useVitals";
import { useConsultRequests } from "@/hooks/useConsultRequests";
import { useLabRequests, useLabResults } from "@/hooks/useLabs";
import { useDischargeReports } from "@/hooks/useDischargeReports";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  caregiverEducationLabel,
  caregiverLabel,
  departmentLabel,
  genderLabel,
  labRequestStatusLabel,
  nationalityLabel,
  phaseStatusLabel,
  priorityLabel,
  t,
} from "@/i18n/ar";
import { DEPARTMENTS, type Department } from "@/constants/departments";
import type { LabPriority } from "@/mock/types";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

export function PatientRecordScreen() {
  const { fileNo = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const setPatientDestination = useAppStore((s) => s.setPatientDestination);

  const { data: patient, isLoading, isError, error, refetch } = usePatient(fileNo);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !patient) {
    if (error?.status === 404) {
      return (
        <div className="py-10">
          <EmptyState title="المريض غير موجود" description={`رقم الإضبارة: ${fileNo}`} />
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate("/patients")}>
              {t.common.back}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </div>
    );
  }

  const ACTIONS = [
    { label: t.patient.actions.requestLab, icon: <FlaskConical />, to: `/patients/${fileNo}/lab-request`, variant: "outline" as const },
    { label: t.patient.actions.reviewResults, icon: <FileCheck2 />, to: `/patients/${fileNo}/results`, variant: "outline" as const },
    { label: t.patient.actions.approveDose, icon: <Syringe />, to: `/patients/${fileNo}/dose`, variant: "highlight" as const },
    { label: t.patient.actions.document, icon: <ClipboardEdit />, to: `/patients/${fileNo}/document`, variant: "outline" as const },
    { label: t.patient.actions.plan, icon: <FilePlus2 />, to: `/patients/${fileNo}/plan`, variant: "outline" as const },
    { label: t.patient.actions.discharge, icon: <Send />, to: `/patients/${fileNo}/discharge`, variant: "default" as const },
  ];

  return (
    <div>
      <PatientContextBar patient={patient} />

      {/* Primary actions toolbar — still route to mock-backed screens (PatientScreenFrame),
          so they'll show "لم يتم العثور على المريض" for a real patient until each is wired. */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ACTIONS.map((a) => (
          <Button key={a.label} variant={a.variant} className="shrink-0" onClick={() => navigate(a.to)}>
            {a.icon}
            {a.label}
          </Button>
        ))}
        {patient.department && (
          <DestinationButton
            current={patient.department}
            onSet={(d) => {
              setPatientDestination(fileNo, d);
              toast.success(t.common.saved, `${t.patient.actions.setDestination}: ${departmentLabel[d]}`);
            }}
          />
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview">{t.patient.overview}</TabsTrigger>
          <TabsTrigger value="demographics">{t.patient.demographics}</TabsTrigger>
          <TabsTrigger value="documentation">{t.patient.documentation}</TabsTrigger>
          <TabsTrigger value="plan">{t.patient.plan}</TabsTrigger>
          <TabsTrigger value="labs">{t.patient.labs}</TabsTrigger>
          <TabsTrigger value="consultRequests">{t.patient.consultRequests}</TabsTrigger>
          <TabsTrigger value="vitals">{t.patient.vitals}</TabsTrigger>
          <TabsTrigger value="notes">{t.patient.notes}</TabsTrigger>
          <TabsTrigger value="discharge">{t.patient.discharge}</TabsTrigger>
          <TabsTrigger value="appointments">{t.patient.appointments}</TabsTrigger>
        </TabsList>

        {/* ── Overview — real data ── */}
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t.patient.overview}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label={t.common.diagnosis} value={patient.diagnosis ?? "لا يوجد تشخيص بعد"} />
                  <Field label={t.common.phase} value={patient.currentPhase ?? "لم تُحدد المرحلة"} />
                  <Field
                    label={t.common.department}
                    value={patient.department ? departmentLabel[patient.department] : null}
                  />
                </dl>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* TODO(api-contract): wired in a later slice (lab-test-requests) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t.patient.labs}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.common.none}</p>
                </CardContent>
              </Card>
              {/* TODO(api-contract): wired in a later slice (disease-documentation) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">مسودات مفتوحة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.common.none}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Demographics — real data ── */}
        <TabsContent value="demographics">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                <Field label={t.common.fileNo} value={patient.fileNoBasma} />
                <Field label={t.common.fileNoBiruni} value={patient.fileNoBiruni} />
                <Field label="الاسم الأول" value={patient.firstName} />
                <Field label="اسم العائلة" value={patient.familyName} />
                <Field label="اسم الأب" value={patient.fatherName} />
                <Field label="اسم الأم" value={patient.motherName} />
                <Field label="تاريخ الميلاد" value={formatDate(patient.dob)} />
                <Field label={t.common.age} value={patient.age != null ? `${patient.age} ${t.common.years}` : null} />
                <Field label={t.common.gender} value={patient.gender ? genderLabel[patient.gender] : null} />
                <Field label="الجنسية" value={nationalityLabel[patient.nationality] ?? patient.nationality} />
                <Field label="الرقم الوطني (المريض)" value={patient.nationalIdPatient} />
                <Field label="الرقم الوطني (الأب)" value={patient.nationalIdFather} />
                <Field label="مقدّم الرعاية" value={caregiverLabel[patient.caregiver] ?? patient.caregiver} />
                <Field
                  label="تعليم مقدّم الرعاية"
                  value={caregiverEducationLabel[patient.caregiverEducation] ?? patient.caregiverEducation}
                />
                <Field label="هاتف الأب" value={patient.phones?.father} />
                <Field label="هاتف الأم" value={patient.phones?.mother} />
                <Field
                  label="القيد العائلي"
                  value={
                    patient.familyRegistry
                      ? `${patient.familyRegistry.country} - ${patient.familyRegistry.governorate} - ${patient.familyRegistry.city}`
                      : null
                  }
                />
                <Field
                  label="مكان الإقامة"
                  value={
                    patient.residence
                      ? `${patient.residence.country} - ${patient.residence.governorate} - ${patient.residence.city}`
                      : null
                  }
                />
                <Field label="تاريخ الإحالة" value={patient.referral ? formatDate(patient.referral.date) : null} />
                <Field label="جهة الإحالة" value={patient.referral?.center} />
                <Field label="اختصاص الطبيب المُحيل" value={patient.referral?.referringDoctorSpecialty} />
                <Field label="نمط الإحالة" value={patient.referral?.pattern} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Documentation — TODO(api-contract): wired in a later slice ── */}
        <TabsContent value="documentation">
          <EmptyState title="لا يوجد توثيق بعد" description="ابدأ بتوثيق المرض عبر قالب." />
        </TabsContent>

        {/* ── Treatment plan — real data, read-only (authoring is a later slice) ── */}
        <TabsContent value="plan">
          <TreatmentPlanTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Labs — real data, read-only (requests + results, no write actions/PDF download yet) ── */}
        <TabsContent value="labs">
          <LabsTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Consult requests — real data, read-only (coordinate lives on the standalone screen) ── */}
        <TabsContent value="consultRequests">
          {patient.consultationNeeds && patient.consultationNeeds.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">{t.patient.consultationNeeds}:</span>
              {patient.consultationNeeds.map((ct) => (
                <ConsultTypeBadge key={ct} type={ct} />
              ))}
            </div>
          )}
          <ConsultRequestsTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Vitals — real data, read-only (nurse's to write) ── */}
        <TabsContent value="vitals">
          <VitalsTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Notes — real data, read + create (POST /clinical-notes) ── */}
        <TabsContent value="notes">
          <ClinicalNotesTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Discharge reports — real data, read-only (authoring is a later slice) ── */}
        <TabsContent value="discharge">
          <DischargeReportsTab patientFileNo={fileNo} />
        </TabsContent>

        {/* ── Appointments — TODO(api-contract): wired in a later slice ── */}
        <TabsContent value="appointments">
          <EmptyState title="لا مواعيد" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClinicalNotesTab({ patientFileNo }: { patientFileNo: string }) {
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useClinicalNotes(patientFileNo);
  const createNote = useCreateClinicalNote(patientFileNo);
  const [draft, setDraft] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const handleSave = () => {
    const body = draft.trim();
    if (!body || createNote.isPending) return;
    setCreateError(null);
    createNote.mutate(body, {
      onSuccess: () => {
        toast.success(t.common.saved, t.patient.actions.addNote);
        setDraft("");
      },
      onError: (err) => setCreateError(err.message),
    });
  };

  const notes = [...(data?.items ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <Textarea
            placeholder="اكتب ملاحظة..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={createNote.isPending}
          />
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!draft.trim() || createNote.isPending}>
              {createNote.isPending ? "جارٍ الحفظ…" : t.patient.actions.addNote}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : notes.length === 0 ? (
        <EmptyState title="لا توجد ملاحظات" />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="space-y-1.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{n.authorName}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const PHASE_STATUS_ICON: Record<string, React.ReactNode> = {
  in_progress: <Loader2 className="size-3.5 animate-spin" />,
  completed: <Check className="size-3.5" />,
  pending: <Circle className="size-3.5" />,
};

const PHASE_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  in_progress: "primary",
  completed: "secondary",
  pending: "muted",
};

function TreatmentPlanTab({ patientFileNo }: { patientFileNo: string }) {
  const { data: plans, isLoading, isError, refetch } = useTreatmentPlans(patientFileNo);

  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!plans || plans.length === 0) {
    return <EmptyState title="لا توجد خطة علاج" description="أنشئ خطة علاج متعددة المراحل." />;
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle>{plan.planName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label={t.plan.startDate} value={formatDate(plan.startDate)} />
              {plan.estimatedEndDate && <Field label={t.plan.endDate} value={formatDate(plan.estimatedEndDate)} />}
              {plan.overallDescription && <Field label={t.plan.description} value={plan.overallDescription} />}
            </dl>

            {plan.phases.length > 0 && (
              <div className="space-y-3">
                {plan.phases.map((phase) => (
                  <Card key={phase.id} className="bg-muted/30">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-foreground">{phase.stageName}</span>
                        <Badge variant={PHASE_STATUS_VARIANT[phase.status] ?? "outline"}>
                          {PHASE_STATUS_ICON[phase.status]}
                          {phaseStatusLabel[phase.status] ?? phase.status}
                        </Badge>
                      </div>

                      {(phase.startDate || phase.endDate) && (
                        <p className="text-xs text-muted-foreground">
                          {phase.startDate ? formatDate(phase.startDate) : "—"}
                          {phase.endDate ? ` – ${formatDate(phase.endDate)}` : ""}
                        </p>
                      )}

                      {phase.description && <p className="text-sm text-foreground">{phase.description}</p>}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {phase.cycles != null && (
                          <span>
                            {t.plan.cycles}: {phase.cycles}
                          </span>
                        )}
                        {phase.visits != null && (
                          <span>
                            {t.plan.visits}: {phase.visits}
                          </span>
                        )}
                        {phase.procedures && (
                          <span>
                            {t.plan.procedures}: {phase.procedures}
                          </span>
                        )}
                        {phase.milestones && (
                          <span>
                            {t.plan.milestones}: {phase.milestones}
                          </span>
                        )}
                      </div>

                      {phase.medications.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-bold text-muted-foreground">{t.plan.medications}</p>
                          <ul className="space-y-0.5">
                            {phase.medications.map((m, mi) => (
                              <li key={m.id ?? mi} className="text-sm text-foreground">
                                {m.name} · {m.dose}
                                {m.schedule ? ` · ${m.schedule}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatMeasurement(value: number | null, unit: string): string {
  return value == null ? "—" : `${value} ${unit}`;
}

function formatBloodPressure(systolic: number | null, diastolic: number | null): string {
  return systolic != null && diastolic != null ? `${systolic}/${diastolic}` : "—";
}

function VitalsTab({ patientFileNo }: { patientFileNo: string }) {
  const { data, isLoading, isError, refetch } = useVitals(patientFileNo);

  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const readings = [...(data ?? [])].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  if (readings.length === 0) {
    return <EmptyState title={t.vitals.empty} />;
  }

  const [latest, ...history] = readings;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t.vitals.latest}</CardTitle>
          <span className="text-xs text-muted-foreground">{formatDateTime(latest.recordedAt)}</span>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label={t.vitals.weight} value={formatMeasurement(latest.weight, "كغ")} />
            <Field label={t.vitals.height} value={formatMeasurement(latest.height, "سم")} />
            <Field label={t.vitals.temperature} value={formatMeasurement(latest.temperature, "°م")} />
            <Field label={t.vitals.pulse} value={formatMeasurement(latest.pulse, "نبضة/د")} />
            <Field
              label={t.vitals.bloodPressure}
              value={formatBloodPressure(latest.bloodPressureSystolic, latest.bloodPressureDiastolic)}
            />
            <Field label={t.vitals.respiratoryRate} value={formatMeasurement(latest.respiratoryRate, "/د")} />
            <Field label={t.vitals.oxygenSaturation} value={formatMeasurement(latest.oxygenSaturation, "%")} />
            <Field label={t.vitals.painScore} value={formatMeasurement(latest.painScore, "/10")} />
          </dl>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.vitals.history}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
              >
                <span className="font-bold text-muted-foreground">{formatDateTime(v.recordedAt)}</span>
                <span className="text-muted-foreground">
                  {formatMeasurement(v.weight, "كغ")} · {formatMeasurement(v.temperature, "°م")} ·{" "}
                  {formatMeasurement(v.pulse, "نبضة/د")} · {formatBloodPressure(v.bloodPressureSystolic, v.bloodPressureDiastolic)} ·{" "}
                  {formatMeasurement(v.oxygenSaturation, "%")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const LAB_PRIORITY_VARIANT: Record<string, BadgeProps["variant"]> = {
  routine: "muted",
  urgent: "warning",
  emergency: "destructive",
};

const LAB_REQUEST_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  results_available: "secondary",
  pending: "warning",
  accepted: "primary",
  rejected: "destructive",
};

function LabsTab({ patientFileNo }: { patientFileNo: string }) {
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests,
  } = useLabRequests(patientFileNo);
  const {
    data: results,
    isLoading: resultsLoading,
    isError: resultsError,
    refetch: refetchResults,
  } = useLabResults(patientFileNo);

  if (requestsLoading || resultsLoading) return <ListSkeleton rows={3} />;
  if (requestsError || resultsError) {
    return (
      <ErrorState
        onRetry={() => {
          refetchRequests();
          refetchResults();
        }}
      />
    );
  }
  if (!requests || requests.length === 0) return <EmptyState title={t.labs.empty} />;

  const sorted = [...requests].sort((a, b) => b.requestDate.localeCompare(a.requestDate));
  const resultsFor = (requestId: string) =>
    (results ?? []).filter((r) => r.requestId === requestId).sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-3">
      {sorted.map((req) => {
        const reqResults = resultsFor(req.id);
        return (
          <Card key={req.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {req.testTypes.length > 0 ? (
                    req.testTypes.map((tt) => (
                      <Badge key={tt} variant="accent">
                        {tt}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {req.laboratoryName ?? "—"} · {formatDate(req.requestDate)}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={LAB_PRIORITY_VARIANT[req.priority] ?? "muted"}>
                    {priorityLabel[req.priority as LabPriority] ?? req.priority}
                  </Badge>
                  {req.preDose && <Badge variant="warning">{t.labs.preDose}</Badge>}
                  {req.reviewed && (
                    <Badge variant="secondary">
                      <CheckCircle2 className="size-3.5" /> {t.labs.reviewed}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant={LAB_REQUEST_STATUS_VARIANT[req.status] ?? "outline"}>
                {labRequestStatusLabel[req.status] ?? req.status}
              </Badge>
            </div>

            {reqResults.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {reqResults.map((res) => (
                  <div key={res.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      {res.summary && <p className="text-foreground">{res.summary}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(res.resultDate)} · v{res.version}
                        {res.uploadedByName ? ` · ${res.uploadedByName}` : ""}
                      </p>
                    </div>
                    <Badge variant="muted">
                      <FileText className="size-3.5" /> {t.labs.pdfAvailable}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function DischargeReportsTab({ patientFileNo }: { patientFileNo: string }) {
  const { data, isLoading, isError, refetch } = useDischargeReports(patientFileNo);

  if (isLoading) return <ListSkeleton rows={2} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا توجد تقارير تخريج" />;

  const sorted = [...data].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  return (
    <div className="space-y-4">
      {sorted.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <CardTitle className="text-base">{report.stageRef ?? "—"}</CardTitle>
            <p className="text-xs text-muted-foreground">{formatDate(report.generatedAt)}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field
                label={t.discharge.lastDoseDate}
                value={report.lastDoseDate ? formatDate(report.lastDoseDate) : null}
              />
              <Field
                label={t.discharge.nextDestination}
                value={report.nextVisitDepartment ? departmentLabel[report.nextVisitDepartment] : null}
              />
            </dl>

            {report.nextDoseDate && (
              <div className="rounded-xl bg-highlight-soft p-3">
                <p className="text-xs font-bold text-highlight-foreground">{t.discharge.nextDoseDate}</p>
                <p className="text-lg font-bold text-highlight-foreground">{formatDate(report.nextDoseDate)}</p>
              </div>
            )}

            {report.prescription.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-bold text-muted-foreground">{t.discharge.prescription}</p>
                <ul className="space-y-1.5">
                  {report.prescription.map((rx, i) => (
                    <li key={i} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <span className="font-bold">{rx.med}</span>
                      {rx.dose && ` · ${rx.dose}`}
                      {rx.instructions && (
                        <span className="block text-xs text-muted-foreground">{rx.instructions}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.doctorInstructions && (
              <div>
                <p className="mb-1 text-xs font-bold text-muted-foreground">{t.discharge.doctorInstructions}</p>
                <p className="text-sm text-foreground">{report.doctorInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ConsultRequestsTab({ patientFileNo }: { patientFileNo: string }) {
  const { items, isLoading, isError, refetch } = useConsultRequests({ patientFileNo });

  if (isLoading) return <ListSkeleton rows={2} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (items.length === 0) return <EmptyState tone="success" title={t.consult.empty} />;

  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-3">
      {sorted.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ConsultTypeBadge type={c.consultationType} />
              </div>
              {c.notes && <p className="mt-1.5 text-sm text-muted-foreground">{c.notes}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {t.consult.requestDate}: {formatDate(c.createdAt)}
              </p>
            </div>
            <ConsultStatusBadge status={c.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function DestinationButton({
  current,
  onSet,
}: {
  current: Department;
  onSet: (d: Department) => void;
}) {
  return (
    <Select value={current} onValueChange={(v) => onSet(v as Department)}>
      <SelectTrigger className="h-11 w-auto shrink-0 gap-2 border-dashed">
        <MapPinned className="size-4 text-muted-foreground" />
        <span className="text-sm font-bold">{t.patient.actions.setDestination}</span>
      </SelectTrigger>
      <SelectContent>
        {DEPARTMENTS.map((d) => (
          <SelectItem key={d} value={d}>
            {departmentLabel[d]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
