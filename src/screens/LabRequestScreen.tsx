import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiChipSelect } from "@/components/ui/chips";
import { SegmentedControl } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { laboratories, TEST_TYPES, testLabel } from "@/mock";
import { priorityLabel, t } from "@/i18n/ar";
import type { LabKind, LabPriority, LabTestRequest } from "@/mock/types";

export function LabRequestScreen() {
  return (
    <PatientScreenFrame title={t.labs.request}>
      {(patient) => <LabRequestInner fileNo={patient.fileNoBasma} />}
    </PatientScreenFrame>
  );
}

function LabRequestInner({ fileNo }: { fileNo: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const addLabRequest = useAppStore((s) => s.addLabRequest);
  const doctor = useAppStore((s) => s.doctor);

  const [labKind, setLabKind] = useState<LabKind>("internal");
  const [labId, setLabId] = useState<string>("");
  const [tests, setTests] = useState<string[]>([]);
  const [indication, setIndication] = useState("");
  const [priority, setPriority] = useState<LabPriority>("routine");
  const [dateRequired, setDateRequired] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredLabs = useMemo(() => laboratories.filter((l) => l.kind === labKind), [labKind]);
  const selectedLab = laboratories.find((l) => l.id === labId);

  // Tests the chosen lab can actually run (mock rule §6.6).
  const allowedTests = selectedLab
    ? TEST_TYPES.filter((tt) => selectedLab.supportedTests.includes(tt.value))
    : TEST_TYPES;

  const submit = () => {
    if (!labId) return setError("يرجى اختيار المخبر.");
    if (tests.length === 0) return setError("يرجى اختيار فحص واحد على الأقل.");
    const unsupported = tests.filter((tv) => selectedLab && !selectedLab.supportedTests.includes(tv));
    if (unsupported.length > 0) {
      return setError(
        `المخبر المختار لا يجري: ${unsupported.map(testLabel).join("، ")}. يرجى اختيار مخبر آخر أو إزالة الفحص.`
      );
    }
    setError(null);
    const req: LabTestRequest = {
      id: `lab-${Date.now()}`,
      patientFileNo: fileNo,
      doctorId: doctor.id,
      laboratoryId: labId,
      labKind,
      testTypes: tests,
      clinicalIndication: indication || undefined,
      priority,
      dateRequired: dateRequired || undefined,
      requestDate: new Date().toISOString(),
      status: "pending",
    };
    addLabRequest(req);
    toast.success("تم إرسال الطلب", `${tests.length} فحص · ${priorityLabel[priority]}`);
    navigate(`/patients/${fileNo}`);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{t.labs.request}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Internal / External toggle */}
        <div className="space-y-2">
          <Label>{t.labs.targetLab}</Label>
          <SegmentedControl<LabKind>
            value={labKind}
            onChange={(v) => {
              setLabKind(v);
              setLabId("");
              setTests([]);
            }}
            options={[
              { value: "internal", label: t.labs.internal },
              { value: "external", label: t.labs.external },
            ]}
          />
        </div>

        {/* Lab select */}
        <div className="space-y-2">
          <Label>{t.labs.targetLab}</Label>
          <Select value={labId} onValueChange={setLabId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المخبر…" />
            </SelectTrigger>
            <SelectContent>
              {filteredLabs.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {labKind === "external" && (
          <p className="flex items-start gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm text-primary">
            <Info className="mt-0.5 size-4 shrink-0" />
            {t.labs.externalNote}
          </p>
        )}

        {/* Tests (multi-select) */}
        <div className="space-y-2">
          <Label>{t.labs.testTypes}</Label>
          <MultiChipSelect
            options={allowedTests}
            selected={tests}
            onToggle={(v) => setTests((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>{t.labs.priority}</Label>
          <SegmentedControl<LabPriority>
            value={priority}
            onChange={setPriority}
            options={[
              { value: "routine", label: priorityLabel.routine },
              { value: "urgent", label: priorityLabel.urgent, activeClassName: "bg-warning text-warning-foreground shadow-sm" },
              { value: "emergency", label: priorityLabel.emergency, activeClassName: "bg-destructive text-destructive-foreground shadow-sm" },
            ]}
          />
        </div>

        {/* Indication */}
        <div className="space-y-2">
          <Label htmlFor="indication">
            {t.labs.indication} <span className="text-xs text-muted-foreground">({t.common.optional})</span>
          </Label>
          <Textarea
            id="indication"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="سبب الطلب السريري…"
          />
        </div>

        {/* Date required */}
        <div className="space-y-2">
          <Label htmlFor="dateRequired">
            {t.labs.dateRequired} <span className="text-xs text-muted-foreground">({t.common.optional})</span>
          </Label>
          <Input id="dateRequired" type="date" value={dateRequired} onChange={(e) => setDateRequired(e.target.value)} />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{error}</p>
        )}

        <Button size="lg" className="w-full" onClick={submit}>
          <Send className="size-5" /> {t.labs.submit}
        </Button>
      </CardContent>
    </Card>
  );
}
