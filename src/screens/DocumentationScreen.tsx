import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, ChevronRight, ChevronLeft, CheckCircle2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { Stepper } from "@/components/Stepper";
import { DynamicField } from "@/components/DynamicField";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { templates } from "@/mock";
import { t } from "@/i18n/ar";
import type { DiseaseDocumentation, MedicalTemplate, TemplateAnswer } from "@/mock/types";

export function DocumentationScreen() {
  return (
    <PatientScreenFrame title={t.document.title}>
      {(patient) => <DocumentationInner fileNo={patient.fileNoBasma} />}
    </PatientScreenFrame>
  );
}

function DocumentationInner({ fileNo }: { fileNo: string }) {
  const { fileNo: routeFileNo } = useParams();
  void routeFileNo;
  const toast = useToast();
  const doctor = useAppStore((s) => s.doctor);
  const documentations = useAppStore((s) => s.documentations);
  const upsert = useAppStore((s) => s.upsertDocumentation);

  // Resume an existing draft for this patient if present.
  const existingDraft = documentations.find((d) => d.patientFileNo === fileNo && d.status === "draft");

  const [templateId, setTemplateId] = useState<string | null>(existingDraft?.templateId ?? null);
  const [docId, setDocId] = useState<string>(existingDraft?.id ?? `doc-${Date.now()}`);
  const [answers, setAnswers] = useState<Record<string, TemplateAnswer>>(existingDraft?.data ?? {});
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const template: MedicalTemplate | undefined = useMemo(
    () => templates.find((tpl) => tpl.id === templateId),
    [templateId]
  );

  const sections = template?.structure.sections ?? [];
  const section = sections[step];

  // Autosave draft (debounced) whenever answers change and a template is chosen.
  const firstRun = useRef(true);
  useEffect(() => {
    if (!template) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = setTimeout(() => {
      const now = new Date().toISOString();
      const draft: DiseaseDocumentation = {
        id: docId,
        patientFileNo: fileNo,
        doctorId: doctor.id,
        templateId: template.id,
        templateName: template.name,
        version: template.version,
        data: answers,
        status: "draft",
        createdAt: existingDraft?.createdAt ?? now,
        lastModifiedAt: now,
      };
      upsert(draft);
      setSavedAt(now);
    }, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, template]);

  const missingRequired = (sIdx: number): string[] =>
    sections[sIdx].questions
      .filter((q) => q.required)
      .filter((q) => {
        const v = answers[q.id];
        return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
      })
      .map((q) => q.id);

  const allMissing = sections.flatMap((_, i) => missingRequired(i));
  const progress = template
    ? Math.round(
        (Object.keys(answers).filter((k) => {
          const v = answers[k];
          return v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
        }).length /
          Math.max(1, sections.flatMap((s) => s.questions).length)) *
          100
      )
    : 0;

  const saveDraft = () => {
    if (!template) return;
    const now = new Date().toISOString();
    upsert({
      id: docId,
      patientFileNo: fileNo,
      doctorId: doctor.id,
      templateId: template.id,
      templateName: template.name,
      version: template.version,
      data: answers,
      status: "draft",
      createdAt: existingDraft?.createdAt ?? now,
      lastModifiedAt: now,
    });
    setSavedAt(now);
    toast.success(t.common.saved, "تم حفظ المسودة.");
  };

  const submit = () => {
    if (!template) return;
    if (allMissing.length > 0) {
      setShowErrors(true);
      toast.error(t.document.requiredFields, "يرجى تعبئة جميع الحقول الإلزامية.");
      // jump to first section with a missing field
      const firstBad = sections.findIndex((_, i) => missingRequired(i).length > 0);
      if (firstBad >= 0) setStep(firstBad);
      return;
    }
    const now = new Date().toISOString();
    upsert({
      id: docId,
      patientFileNo: fileNo,
      doctorId: doctor.id,
      templateId: template.id,
      templateName: template.name,
      version: template.version,
      data: answers,
      status: "submitted",
      createdAt: existingDraft?.createdAt ?? now,
      lastModifiedAt: now,
    });
    setSubmitted(true);
    toast.celebrate(t.document.submitSuccess);
  };

  // ── Template picker ──
  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.document.chooseTemplate}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(v) => { setTemplateId(v); setDocId(`doc-${Date.now()}`); }}>
            <SelectTrigger>
              <SelectValue placeholder={t.document.searchTemplate} />
            </SelectTrigger>
            <SelectContent>
              {templates
                .filter((tpl) => tpl.isActive)
                .map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.name} · {t.document.version} {tpl.version}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => { setTemplateId(tpl.id); setDocId(`doc-${Date.now()}`); }}
                className="rounded-xl border border-border p-4 text-right transition hover:border-primary/50 hover:bg-primary-soft/40"
              >
                <p className="font-bold">{tpl.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tpl.description}</p>
                <Badge variant="accent" className="mt-2">
                  {t.document.version} {tpl.version}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <CheckCircle2 className="size-9" />
          </span>
          <div>
            <p className="text-xl font-bold">{t.document.submitSuccess}</p>
            <p className="mt-1 text-sm text-muted-foreground">{template.name}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLast = step === sections.length - 1;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.document.version} {template.version} · {t.document.progress} {progress}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="flex items-center gap-1 text-xs font-bold text-secondary">
                  <Check className="size-3.5" /> {t.document.autosaved}
                </span>
              )}
              <Button variant="link" size="sm" onClick={() => setTemplateId(null)}>
                {t.document.chooseTemplate}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Stepper steps={sections.map((s) => s.title)} current={step} />

      <Card>
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
          {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
        </CardHeader>
        <CardContent className="space-y-6">
          {section.questions.map((q) => (
            <DynamicField
              key={q.id}
              question={q}
              value={answers[q.id] ?? null}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              invalid={showErrors && q.required && missingRequired(step).includes(q.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Nav + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronRight className="size-4" /> {t.common.previous}
        </Button>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveDraft}>
            <Save className="size-4" /> {t.common.saveDraft}
          </Button>
          {isLast ? (
            <Button onClick={submit}>
              <Check className="size-4" /> {t.common.saveSubmit}
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}>
              {t.common.next} <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
