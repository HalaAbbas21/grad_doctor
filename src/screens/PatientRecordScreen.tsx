import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardEdit,
  FileCheck2,
  FilePlus2,
  FlaskConical,
  MapPinned,
  MessageSquarePlus,
  Send,
  Syringe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PatientContextBar } from "@/components/PatientContextBar";
import { StageTimeline } from "@/components/StageTimeline";
import { LabStatusBadge, StageStatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { computeAge, formatDate, formatDateTime } from "@/lib/utils";
import { testLabel } from "@/mock/laboratories";
import {
  caregiverEducationLabel,
  caregiverLabel,
  departmentLabel,
  genderLabel,
  nationalityLabel,
  priorityLabel,
  t,
} from "@/i18n/ar";
import type { Department } from "@/mock/types";

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
  const patients = useAppStore((s) => s.patients);
  const documentations = useAppStore((s) => s.documentations);
  const treatmentPlans = useAppStore((s) => s.treatmentPlans);
  const labRequests = useAppStore((s) => s.labRequests);
  const notes = useAppStore((s) => s.notes);
  const dischargeReports = useAppStore((s) => s.dischargeReports);
  const appointments = useAppStore((s) => s.appointments);
  const addNote = useAppStore((s) => s.addNote);
  const setPatientDestination = useAppStore((s) => s.setPatientDestination);
  const doctor = useAppStore((s) => s.doctor);

  const patient = patients.find((p) => p.fileNoBasma === fileNo);
  const [noteText, setNoteText] = useState("");

  if (!patient) {
    return (
      <div className="py-10">
        <EmptyState title="لم يتم العثور على المريض" description={`رقم الإضبارة: ${fileNo}`} />
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => navigate("/patients")}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const docs = documentations.filter((d) => d.patientFileNo === fileNo);
  const plan = treatmentPlans.find((p) => p.patientFileNo === fileNo);
  const labs = labRequests.filter((l) => l.patientFileNo === fileNo);
  const patientNotes = notes.filter((n) => n.patientFileNo === fileNo);
  const discharges = dischargeReports.filter((d) => d.patientFileNo === fileNo);
  const appts = appointments.filter((a) => a.patientFileNo === fileNo);

  const submitNote = () => {
    if (!noteText.trim()) return;
    addNote({
      id: `note-${Date.now()}`,
      patientFileNo: fileNo,
      doctorId: doctor.id,
      authorName: `د. ${doctor.firstName} ${doctor.lastName}`,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    });
    setNoteText("");
    toast.success(t.common.saved, "تمت إضافة الملاحظة.");
  };

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

      {/* Primary actions toolbar */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ACTIONS.map((a) => (
          <Button key={a.label} variant={a.variant} className="shrink-0" onClick={() => navigate(a.to)}>
            {a.icon}
            {a.label}
          </Button>
        ))}
        <DestinationButton
          current={patient.department}
          onSet={(d) => {
            setPatientDestination(fileNo, d);
            toast.success(t.common.saved, `${t.patient.actions.setDestination}: ${departmentLabel[d]}`);
          }}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview">{t.patient.overview}</TabsTrigger>
          <TabsTrigger value="demographics">{t.patient.demographics}</TabsTrigger>
          <TabsTrigger value="documentation">{t.patient.documentation}</TabsTrigger>
          <TabsTrigger value="plan">{t.patient.plan}</TabsTrigger>
          <TabsTrigger value="labs">{t.patient.labs}</TabsTrigger>
          <TabsTrigger value="vitals">{t.patient.vitals}</TabsTrigger>
          <TabsTrigger value="notes">{t.patient.notes}</TabsTrigger>
          <TabsTrigger value="discharge">{t.patient.discharge}</TabsTrigger>
          <TabsTrigger value="appointments">{t.patient.appointments}</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t.patient.overview}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label={t.common.diagnosis} value={patient.diagnosis} />
                  <Field label={t.common.phase} value={patient.currentPhase} />
                  <Field label={t.common.department} value={departmentLabel[patient.department]} />
                </dl>
                {plan && (
                  <div>
                    <p className="mb-2 text-sm font-bold text-muted-foreground">{t.plan.timeline}</p>
                    <StageTimeline stages={plan.phases} />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t.patient.labs}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {labs.slice(0, 2).map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{l.testTypes.map(testLabel).join("، ")}</span>
                      <LabStatusBadge status={l.status} />
                    </div>
                  ))}
                  {labs.length === 0 && <p className="text-sm text-muted-foreground">{t.common.none}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">مسودات مفتوحة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {docs.filter((d) => d.status === "draft").map((d) => (
                    <button
                      key={d.id}
                      onClick={() => navigate(`/patients/${fileNo}/document`)}
                      className="flex w-full items-center justify-between gap-2 text-right text-sm hover:text-primary"
                    >
                      <span className="truncate">{d.templateName}</span>
                      <Badge variant="accent">مسودة</Badge>
                    </button>
                  ))}
                  {docs.filter((d) => d.status === "draft").length === 0 && (
                    <p className="text-sm text-muted-foreground">{t.common.none}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Demographics ── */}
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
                <Field label={t.common.age} value={`${computeAge(patient.dob)} ${t.common.years}`} />
                <Field label={t.common.gender} value={genderLabel[patient.gender]} />
                <Field label="الجنسية" value={nationalityLabel[patient.nationality]} />
                <Field label="الرقم الوطني (المريض)" value={patient.nationalIdPatient} />
                <Field label="الرقم الوطني (الأب)" value={patient.nationalIdFather} />
                <Field label="مقدّم الرعاية" value={caregiverLabel[patient.caregiver]} />
                <Field label="تعليم مقدّم الرعاية" value={caregiverEducationLabel[patient.caregiverEducation]} />
                <Field label="هاتف الأب" value={patient.phones.father} />
                <Field label="هاتف الأم" value={patient.phones.mother} />
                <Field
                  label="القيد العائلي"
                  value={`${patient.familyRegistry.country} - ${patient.familyRegistry.governorate} - ${patient.familyRegistry.city}`}
                />
                <Field
                  label="مكان الإقامة"
                  value={`${patient.residence.country} - ${patient.residence.governorate} - ${patient.residence.city}`}
                />
                <Field label="تاريخ الإحالة" value={formatDate(patient.referral.date)} />
                <Field label="جهة الإحالة" value={patient.referral.center} />
                <Field label="اختصاص الطبيب المُحيل" value={patient.referral.referringDoctorSpecialty} />
                <Field label="نمط الإحالة" value={patient.referral.pattern} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Documentation ── */}
        <TabsContent value="documentation">
          <div className="mb-3 flex justify-end">
            <Button onClick={() => navigate(`/patients/${fileNo}/document`)}>
              <ClipboardEdit className="size-4" /> {t.document.title}
            </Button>
          </div>
          {docs.length === 0 ? (
            <EmptyState title="لا يوجد توثيق بعد" description="ابدأ بتوثيق المرض عبر قالب." />
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <Card
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/patients/${fileNo}/document`)}
                  className="flex cursor-pointer items-center justify-between p-4 hover:border-primary/40"
                >
                  <div>
                    <p className="font-bold">{d.templateName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.document.version} {d.version} · {formatDateTime(d.lastModifiedAt)}
                    </p>
                  </div>
                  <Badge variant={d.status === "draft" ? "accent" : "secondary"}>
                    {d.status === "draft" ? "مسودة" : "مُقدّم"}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Plan ── */}
        <TabsContent value="plan">
          <div className="mb-3 flex justify-end">
            <Button onClick={() => navigate(`/patients/${fileNo}/plan`)}>
              <FilePlus2 className="size-4" /> {plan ? t.common.edit : t.plan.builder}
            </Button>
          </div>
          {!plan ? (
            <EmptyState title="لا توجد خطة علاج" description="أنشئ خطة علاج متعددة المراحل." />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{plan.planName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(plan.startDate)} ← {formatDate(plan.estimatedEndDate)}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <StageTimeline stages={plan.phases} />
                <div className="space-y-3">
                  {plan.phases.map((s) => (
                    <div key={s.id} className="rounded-xl border border-border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-bold">{s.stageName}</p>
                        <StageStatusBadge status={s.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.startDate)} ← {formatDate(s.endDate)} · {s.cycles} دورات · {s.visits} زيارات
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.medications.map((m) => (
                          <Badge key={m.name} variant="primary">
                            {m.name} · {m.dose}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Labs ── */}
        <TabsContent value="labs">
          <div className="mb-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(`/patients/${fileNo}/results`)}>
              <FileCheck2 className="size-4" /> {t.labs.reviewResults}
            </Button>
            <Button onClick={() => navigate(`/patients/${fileNo}/lab-request`)}>
              <FlaskConical className="size-4" /> {t.labs.request}
            </Button>
          </div>
          {labs.length === 0 ? (
            <EmptyState title="لا توجد فحوص" />
          ) : (
            <div className="space-y-3">
              {labs.map((l) => (
                <Card key={l.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{l.testTypes.map(testLabel).join("، ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.labKind === "internal" ? t.labs.internal : t.labs.external} ·{" "}
                        {priorityLabel[l.priority]} · {formatDate(l.requestDate)}
                      </p>
                    </div>
                    <LabStatusBadge status={l.status} />
                  </div>
                  {l.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm text-destructive">
                      {l.rejectionReason}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Vitals ── */}
        <TabsContent value="vitals">
          <VitalsTab fileNo={fileNo} />
        </TabsContent>

        {/* ── Notes ── */}
        <TabsContent value="notes">
          <Card className="mb-4">
            <CardContent className="space-y-3 p-4">
              <Textarea
                placeholder="أضف ملاحظة سريرية…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={submitNote} disabled={!noteText.trim()}>
                  <MessageSquarePlus className="size-4" /> {t.patient.actions.addNote}
                </Button>
              </div>
            </CardContent>
          </Card>
          {patientNotes.length === 0 ? (
            <EmptyState title="لا ملاحظات بعد" />
          ) : (
            <div className="space-y-3">
              {patientNotes.map((n) => (
                <Card key={n.id} className="p-4">
                  <p className="text-foreground">{n.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {n.authorName} · {formatDateTime(n.createdAt)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Discharge ── */}
        <TabsContent value="discharge">
          <div className="mb-3 flex justify-end">
            <Button onClick={() => navigate(`/patients/${fileNo}/discharge`)}>
              <Send className="size-4" /> {t.discharge.new}
            </Button>
          </div>
          {discharges.length === 0 ? (
            <EmptyState title="لا تقارير تخريج" />
          ) : (
            <div className="space-y-3">
              {discharges.map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{d.stageRef}</p>
                    <Badge variant="secondary">{formatDate(d.generatedAt)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{d.doctorInstructions}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.discharge.nextDestination}: {departmentLabel[d.nextVisitDepartment]}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Appointments ── */}
        <TabsContent value="appointments">
          {appts.length === 0 ? (
            <EmptyState title="لا مواعيد" />
          ) : (
            <div className="space-y-3">
              {appts.map((a) => (
                <Card key={a.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold">{formatDateTime(a.dateTime)}</p>
                    <p className="text-xs text-muted-foreground">{a.assignedStaff}</p>
                  </div>
                  <Badge variant="muted">{a.status}</Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
        <SelectItem value="inpatient">{departmentLabel.inpatient}</SelectItem>
        <SelectItem value="daycare">{departmentLabel.daycare}</SelectItem>
        <SelectItem value="clinic">{departmentLabel.clinic}</SelectItem>
      </SelectContent>
    </Select>
  );
}

function VitalsTab({ fileNo }: { fileNo: string }) {
  const vitals = useAppStore((s) => s.vitals).filter((v) => v.patientFileNo === fileNo);
  if (vitals.length === 0) return <EmptyState title="لا توجد علامات حيوية مسجّلة" />;
  return (
    <div className="space-y-3">
      {vitals.map((v) => (
        <Card key={v.id} className="p-4">
          <p className="mb-3 text-xs text-muted-foreground">{formatDateTime(v.recordedAt)}</p>
          <dl className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <Field label="الوزن" value={`${v.weight} kg`} />
            <Field label="الطول" value={`${v.height} cm`} />
            <Field label="الحرارة" value={`${v.temperature}°`} />
            <Field label="النبض" value={`${v.pulse}`} />
            <Field label="الضغط" value={v.bloodPressure} />
            <Field label="التنفس" value={`${v.respiratoryRate}`} />
          </dl>
        </Card>
      ))}
    </div>
  );
}
