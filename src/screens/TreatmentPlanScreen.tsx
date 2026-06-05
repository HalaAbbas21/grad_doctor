import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { StageTimeline } from "@/components/StageTimeline";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { stageStatusLabel, t } from "@/i18n/ar";
import type { Medication, StageStatus, TreatmentPlan, TreatmentStage } from "@/mock/types";

export function TreatmentPlanScreen() {
  return (
    <PatientScreenFrame title={t.plan.builder}>
      {(patient) => <PlanInner fileNo={patient.fileNoBasma} />}
    </PatientScreenFrame>
  );
}

function emptyStage(planId: string, name = ""): TreatmentStage {
  return {
    id: `st-${Date.now()}-${Math.round(performance.now())}`,
    planId,
    stageName: name,
    startDate: "",
    endDate: "",
    medications: [],
    procedures: "",
    cycles: 1,
    visits: 1,
    milestones: "",
    status: "pending",
  };
}

function PlanInner({ fileNo }: { fileNo: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const doctor = useAppStore((s) => s.doctor);
  const existing = useAppStore((s) => s.treatmentPlans.find((p) => p.patientFileNo === fileNo));
  const upsert = useAppStore((s) => s.upsertTreatmentPlan);

  const planId = existing?.id ?? `plan-${Date.now()}`;
  const [planName, setPlanName] = useState(existing?.planName ?? "");
  const [startDate, setStartDate] = useState(existing?.startDate ?? "");
  const [endDate, setEndDate] = useState(existing?.estimatedEndDate ?? "");
  const [description, setDescription] = useState(existing?.overallDescription ?? "");
  const [stages, setStages] = useState<TreatmentStage[]>(existing?.phases ?? []);
  const [error, setError] = useState<string | null>(null);

  const updateStage = (id: string, patch: Partial<TreatmentStage>) =>
    setStages((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStage = (name = "") => setStages((ss) => [...ss, emptyStage(planId, name)]);
  const removeStage = (id: string) => setStages((ss) => ss.filter((s) => s.id !== id));

  const addMed = (stageId: string) =>
    updateStage(stageId, {
      medications: [
        ...(stages.find((s) => s.id === stageId)?.medications ?? []),
        { name: "", dose: "", schedule: "" },
      ],
    });

  const updateMed = (stageId: string, idx: number, patch: Partial<Medication>) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    const meds = stage.medications.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    updateStage(stageId, { medications: meds });
  };

  const removeMed = (stageId: string, idx: number) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    updateStage(stageId, { medications: stage.medications.filter((_, i) => i !== idx) });
  };

  const validateChrono = (): boolean => {
    const dated = stages.filter((s) => s.startDate);
    for (let i = 1; i < dated.length; i++) {
      if (dated[i].startDate < dated[i - 1].startDate) return false;
    }
    return true;
  };

  const buildPlan = (): TreatmentPlan => ({
    id: planId,
    patientFileNo: fileNo,
    doctorId: doctor.id,
    planName: planName || "خطة علاج",
    startDate,
    estimatedEndDate: endDate,
    overallDescription: description || undefined,
    phases: stages,
  });

  const saveDraft = () => {
    upsert(buildPlan());
    toast.success(t.common.saved, "تم حفظ المسودة.");
  };

  const saveFinal = () => {
    if (!validateChrono()) {
      setError(t.plan.chronoError);
      toast.error(t.plan.chronoError);
      return;
    }
    setError(null);
    upsert(buildPlan());
    toast.celebrate(t.common.saved, "تم حفظ خطة العلاج.");
    navigate(`/patients/${fileNo}`);
  };

  return (
    <div className="space-y-5">
      {/* Plan header fields */}
      <Card>
        <CardHeader>
          <CardTitle>{t.plan.builder}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pn">{t.plan.planName}</Label>
            <Input id="pn" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="مثال: بروتوكول ALL" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sd">{t.plan.startDate}</Label>
            <Input id="sd" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ed">{t.plan.endDate}</Label>
            <Input id="ed" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">{t.plan.description}</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Live timeline preview */}
      {stages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.plan.timeline}</CardTitle>
          </CardHeader>
          <CardContent>
            <StageTimeline stages={stages} />
          </CardContent>
        </Card>
      )}

      {/* Stage cards */}
      <div className="space-y-4">
        {stages.map((s, idx) => (
          <Card key={s.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">
                {t.plan.stages} {idx + 1}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeStage(s.id)} aria-label={t.common.remove}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.plan.stageName}</Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {t.plan.presetStages.map((preset) => (
                    <Chip
                      key={preset}
                      label={preset}
                      selected={s.stageName === preset}
                      onClick={() => updateStage(s.id, { stageName: preset })}
                    />
                  ))}
                </div>
                <Input
                  value={s.stageName}
                  onChange={(e) => updateStage(s.id, { stageName: e.target.value })}
                  placeholder={t.plan.custom}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.plan.startDate}</Label>
                  <Input type="date" value={s.startDate} onChange={(e) => updateStage(s.id, { startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.plan.endDate}</Label>
                  <Input type="date" value={s.endDate} onChange={(e) => updateStage(s.id, { endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.plan.cycles}</Label>
                  <Input type="number" value={s.cycles} onChange={(e) => updateStage(s.id, { cycles: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.plan.visits}</Label>
                  <Input type="number" value={s.visits} onChange={(e) => updateStage(s.id, { visits: Number(e.target.value) })} />
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t.plan.medications}</Label>
                  <Button variant="ghost" size="sm" onClick={() => addMed(s.id)}>
                    <Plus className="size-4" /> {t.plan.addMed}
                  </Button>
                </div>
                {s.medications.map((m, mi) => (
                  <div key={mi} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <Input placeholder={t.plan.medName} value={m.name} onChange={(e) => updateMed(s.id, mi, { name: e.target.value })} />
                    <Input placeholder={t.plan.dose} value={m.dose} onChange={(e) => updateMed(s.id, mi, { dose: e.target.value })} />
                    <Input placeholder={t.plan.schedule} value={m.schedule} onChange={(e) => updateMed(s.id, mi, { schedule: e.target.value })} />
                    <Button variant="ghost" size="icon" onClick={() => removeMed(s.id, mi)} aria-label={t.common.remove}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.plan.procedures}</Label>
                  <Input value={s.procedures} onChange={(e) => updateStage(s.id, { procedures: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.plan.milestones}</Label>
                  <Input value={s.milestones} onChange={(e) => updateStage(s.id, { milestones: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.common.status}</Label>
                <Select value={s.status} onValueChange={(v) => updateStage(s.id, { status: v as StageStatus })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(stageStatusLabel) as StageStatus[]).map((st) => (
                      <SelectItem key={st} value={st}>
                        {stageStatusLabel[st]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={() => addStage()}>
        <Plus className="size-4" /> {t.plan.addStage}
      </Button>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{error}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={saveDraft}>
          <Save className="size-4" /> {t.common.saveDraft}
        </Button>
        <Button onClick={saveFinal} disabled={stages.length === 0}>
          <Check className="size-4" /> {t.common.save}
        </Button>
      </div>

      {stages.length === 0 && (
        <Badge variant="muted" className="mx-auto">
          أضف مرحلة واحدة على الأقل للحفظ
        </Badge>
      )}
    </div>
  );
}
