import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileCheck2, Plus, Printer, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { computeAge, formatDate } from "@/lib/utils";
import { departmentLabel, t } from "@/i18n/ar";
import type { Department, DischargeReport, Patient, PrescriptionItem } from "@/mock/types";

export function DischargeScreen() {
  return (
    <PatientScreenFrame title={t.discharge.title} subtitle={t.discharge.doctorOnly}>
      {(patient) => <DischargeInner patient={patient} />}
    </PatientScreenFrame>
  );
}

function DischargeInner({ patient }: { patient: Patient }) {
  const fileNo = patient.fileNoBasma;
  const navigate = useNavigate();
  const toast = useToast();
  const doctor = useAppStore((s) => s.doctor);
  const addDischargeReport = useAppStore((s) => s.addDischargeReport);

  const [lastDoseDate, setLastDoseDate] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([
    { med: "", dose: "", instructions: "" },
  ]);
  const [instructions, setInstructions] = useState("");
  const [nextDoseDate, setNextDoseDate] = useState("");
  const [nextDept, setNextDept] = useState<Department>("daycare");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);

  const updateRx = (idx: number, patch: Partial<PrescriptionItem>) =>
    setPrescription((rx) => rx.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const addRx = () => setPrescription((rx) => [...rx, { med: "", dose: "", instructions: "" }]);
  const removeRx = (idx: number) => setPrescription((rx) => rx.filter((_, i) => i !== idx));

  const generate = () => {
    const report: DischargeReport = {
      id: `dis-${Date.now()}`,
      patientFileNo: fileNo,
      doctorId: doctor.id,
      stageRef: patient.currentPhase,
      lastDoseDate: lastDoseDate || undefined,
      prescription: prescription.filter((r) => r.med.trim()),
      doctorInstructions: instructions,
      nextDoseDate: nextDoseDate || undefined,
      nextVisitDepartment: nextDept,
      generatedBy: `د. ${doctor.firstName} ${doctor.lastName}`,
      generatedAt: new Date().toISOString(),
      exportable: true,
    };
    addDischargeReport(report);
    setDone(true);
    toast.celebrate(t.discharge.generated, `${patient.firstName} ${patient.familyName}`);
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <CheckCircle2 className="size-9" />
          </span>
          <p className="text-xl font-bold">{t.discharge.generated}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> {t.common.print}
            </Button>
            <Button onClick={() => navigate(`/patients/${fileNo}`)}>{t.patient.record}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{t.discharge.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ldd">{t.discharge.lastDoseDate}</Label>
              <Input id="ldd" type="date" value={lastDoseDate} onChange={(e) => setLastDoseDate(e.target.value)} />
            </div>

            {/* Prescription rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t.discharge.prescription}</Label>
                <Button variant="ghost" size="sm" onClick={addRx}>
                  <Plus className="size-4" /> {t.discharge.addMed}
                </Button>
              </div>
              {prescription.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input placeholder={t.discharge.med} value={r.med} onChange={(e) => updateRx(i, { med: e.target.value })} />
                  <Input placeholder={t.discharge.dose} value={r.dose} onChange={(e) => updateRx(i, { dose: e.target.value })} />
                  <Button variant="ghost" size="icon" onClick={() => removeRx(i)} aria-label={t.common.remove}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                  <Input
                    className="sm:col-span-3"
                    placeholder={t.discharge.instructions}
                    value={r.instructions}
                    onChange={(e) => updateRx(i, { instructions: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ins">{t.discharge.doctorInstructions}</Label>
              <Textarea id="ins" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="تعليمات المتابعة للأسرة…" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ndd">{t.discharge.nextDoseDate}</Label>
                <Input id="ndd" type="date" value={nextDoseDate} onChange={(e) => setNextDoseDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.discharge.nextDestination}</Label>
                <Select value={nextDept} onValueChange={(v) => setNextDept(v as Department)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inpatient">{departmentLabel.inpatient}</SelectItem>
                    <SelectItem value="daycare">{departmentLabel.daycare}</SelectItem>
                    <SelectItem value="clinic">{departmentLabel.clinic}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => setConfirmOpen(true)}>
              <FileCheck2 className="size-5" /> {t.discharge.generate}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live preview (what the family will see) */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="mb-2 text-sm font-bold text-muted-foreground">
          {t.discharge.preview} — {t.discharge.forFamily}
        </p>
        <Card className="overflow-hidden">
          <div className="bg-hope p-5 text-white">
            <p className="font-display text-lg font-bold">{t.appName} · {t.discharge.title}</p>
            <p className="text-sm opacity-90">
              {patient.firstName} {patient.familyName} · {computeAge(patient.dob)} {t.common.years}
            </p>
            <p className="font-mono text-xs opacity-90">{patient.fileNoBasma}</p>
          </div>
          <CardContent className="space-y-4 p-5 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{t.discharge.lastDoseDate}</p>
                <p className="font-bold">{formatDate(lastDoseDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.discharge.nextDoseDate}</p>
                <p className="font-bold">{formatDate(nextDoseDate)}</p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold text-muted-foreground">{t.discharge.prescription}</p>
              {prescription.filter((r) => r.med.trim()).length === 0 ? (
                <p className="text-muted-foreground">—</p>
              ) : (
                <ul className="space-y-1">
                  {prescription
                    .filter((r) => r.med.trim())
                    .map((r, i) => (
                      <li key={i} className="rounded-lg bg-muted/60 px-3 py-2">
                        <span className="font-bold">{r.med}</span>
                        {r.dose && ` · ${r.dose}`}
                        {r.instructions && <span className="block text-xs text-muted-foreground">{r.instructions}</span>}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs font-bold text-muted-foreground">{t.discharge.doctorInstructions}</p>
              <p>{instructions || "—"}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Badge variant="primary">
                {t.discharge.nextDestination}: {departmentLabel[nextDept]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                د. {doctor.firstName} {doctor.lastName}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.discharge.generate}
        description={`${patient.firstName} ${patient.familyName} · ${patient.fileNoBasma}`}
        confirmLabel={t.discharge.generate}
        onConfirm={generate}
      />
    </div>
  );
}
