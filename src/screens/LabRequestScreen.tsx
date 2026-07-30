import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiChipSelect } from "@/components/ui/chips";
import { SegmentedControl } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { useLaboratories } from "@/hooks/useLaboratories";
import { useCreateLabTestRequest } from "@/hooks/useLabs";
import { useToast } from "@/components/ui/toast";
import { priorityLabel, t } from "@/i18n/ar";
import type { LabPriority } from "@/mock/types";

const PRIORITY_OPTIONS: { value: string; label: string; activeClassName?: string }[] = [
  { value: "routine", label: priorityLabel.routine },
  { value: "urgent", label: priorityLabel.urgent, activeClassName: "bg-warning text-warning-foreground shadow-sm" },
  {
    value: "emergency",
    label: priorityLabel.emergency,
    activeClassName: "bg-destructive text-destructive-foreground shadow-sm",
  },
];

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
  const { data: labs, isLoading: labsLoading, isError: labsError, refetch: refetchLabs } = useLaboratories();
  const createRequest = useCreateLabTestRequest();

  const [labKind, setLabKind] = useState<string>("internal");
  const [labId, setLabId] = useState<string>("");
  const [tests, setTests] = useState<string[]>([]);
  const [indication, setIndication] = useState("");
  const [priority, setPriority] = useState<string>("routine");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // TODO(api-contract): confirm the backend actually rejects requests to
  // non-completed labs, or if this is purely a frontend courtesy filter.
  const availableLabs = useMemo(() => (labs ?? []).filter((l) => l.profileStatus === "completed"), [labs]);
  const hiddenLabCount = (labs?.length ?? 0) - availableLabs.length;

  const filteredLabs = useMemo(() => availableLabs.filter((l) => l.kind === labKind), [availableLabs, labKind]);
  const selectedLab = availableLabs.find((l) => l.id === labId);

  // Union of every lab's supported tests — the fallback vocabulary when the
  // selected lab's own supportedTests is empty/null (don't block selection).
  const allTestTypes = useMemo(() => {
    const set = new Set<string>();
    for (const lab of labs ?? []) {
      for (const tt of lab.supportedTests) set.add(tt);
    }
    return Array.from(set);
  }, [labs]);

  // Tests the chosen lab can actually run — falls back to the full known set when unconstrained.
  const selectableTests = useMemo(() => {
    if (selectedLab && selectedLab.supportedTests.length > 0) return selectedLab.supportedTests;
    return allTestTypes;
  }, [selectedLab, allTestTypes]);

  const openConfirm = () => {
    if (!labId) return setFormError("يرجى اختيار المخبر.");
    if (tests.length === 0) return setFormError("يرجى اختيار فحص واحد على الأقل.");
    setFormError(null);
    setConfirmOpen(true);
  };

  const submit = () => {
    if (!selectedLab) return;
    createRequest.mutate(
      {
        patientFileNo: fileNo,
        laboratoryId: Number(selectedLab.id),
        testTypes: tests,
        priority,
        clinicalIndication: indication || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t.labs.submit, `${tests.length} فحص · ${priorityLabel[priority as LabPriority] ?? priority}`);
          setConfirmOpen(false);
          navigate(`/patients/${fileNo}`);
        },
        onError: (err) => {
          setConfirmOpen(false);
          setFormError(err.message);
        },
      }
    );
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
          <SegmentedControl<string>
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
        {labsLoading ? (
          <Skeleton className="h-11 w-full" />
        ) : labsError ? (
          <ErrorState onRetry={() => refetchLabs()} />
        ) : (
          <div className="space-y-2">
            <Label>{t.labs.targetLab}</Label>
            <Select
              value={labId}
              onValueChange={(v) => {
                setLabId(v);
                setTests([]);
              }}
            >
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
            {hiddenLabCount > 0 && (
              <p className="text-xs text-muted-foreground">بعض المخابر غير متاحة حالياً</p>
            )}
          </div>
        )}

        {labKind === "external" && (
          <p className="flex items-start gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm text-primary">
            <Info className="mt-0.5 size-4 shrink-0" />
            {t.labs.externalNote}
          </p>
        )}

        {/* Tests (multi-select) */}
        <div className="space-y-2">
          <Label>{t.labs.testTypes}</Label>
          {selectedLab ? (
            <MultiChipSelect
              options={selectableTests.map((tt) => ({ value: tt, label: tt }))}
              selected={tests}
              onToggle={(v) => setTests((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">اختر مخبراً أولاً لعرض الفحوص المتاحة.</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>{t.labs.priority}</Label>
          <SegmentedControl<string> value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
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

        {formError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{formError}</p>
        )}

        <Button size="lg" className="w-full" onClick={openConfirm}>
          <Send className="size-5" /> {t.labs.submit}
        </Button>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
        title={t.labs.submit}
        description={selectedLab ? `${selectedLab.name} · ${tests.length} فحص` : undefined}
        confirmLabel={t.labs.submit}
        onConfirm={submit}
        loading={createRequest.isPending}
      />
    </Card>
  );
}
