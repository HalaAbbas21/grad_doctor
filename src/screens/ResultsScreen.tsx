import { Check, CheckCircle2, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/states";
import { PatientScreenFrame } from "@/components/PatientScreenFrame";
import { LabStatusBadge } from "@/components/StatusBadge";
import { PdfViewer } from "@/components/PdfViewer";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { testLabel } from "@/mock";
import { priorityLabel, t } from "@/i18n/ar";

export function ResultsScreen() {
  return (
    <PatientScreenFrame title={t.labs.reviewResults}>
      {(patient) => <ResultsInner fileNo={patient.fileNoBasma} />}
    </PatientScreenFrame>
  );
}

function ResultsInner({ fileNo }: { fileNo: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const labRequests = useAppStore((s) => s.labRequests);
  const markLabReviewed = useAppStore((s) => s.markLabReviewed);
  const simulateError = useAppStore((s) => s.simulateDownloadError);
  const setSimulateError = useAppStore((s) => s.setSimulateDownloadError);

  const results = labRequests.filter(
    (l) => l.patientFileNo === fileNo && l.status === "results-available"
  );

  return (
    <div className="space-y-5">
      {/* Dev toggle to demonstrate error states */}
      <div className="flex items-center justify-end gap-2 rounded-lg border border-dashed border-border bg-card/60 px-4 py-2.5">
        <Label htmlFor="failtoggle" className="text-muted-foreground">
          {t.labs.failDownloadToggle}
        </Label>
        <Switch id="failtoggle" checked={simulateError} onCheckedChange={setSimulateError} />
      </div>

      {results.length === 0 ? (
        <EmptyState title="لا توجد نتائج بعد" description="ستظهر النتائج هنا بمجرد توفّرها." />
      ) : (
        results.map((l) => (
          <Card key={l.id} className={l.isExternalNew ? "ring-2 ring-secondary/50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{l.testTypes.map(testLabel).join("، ")}</CardTitle>
                <div className="flex items-center gap-2">
                  {l.isExternalNew && <Badge variant="secondary">نتيجة خارجية جديدة</Badge>}
                  <LabStatusBadge status={l.status} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {l.labKind === "internal" ? t.labs.internal : t.labs.external} · {priorityLabel[l.priority]} ·
                {" "}
                {t.common.date}: {formatDate(l.resultUploadDate)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <PdfViewer fileName={`${l.testTypes.map(testLabel).join("_")}.pdf`} />

              <div className="flex flex-wrap items-center justify-between gap-2">
                {l.reviewed ? (
                  <Badge variant="secondary">
                    <CheckCircle2 className="size-3.5" /> {t.labs.reviewed}
                  </Badge>
                ) : (
                  <Badge variant="warning">{t.labs.notReviewed}</Badge>
                )}

                <div className="flex gap-2">
                  {!l.reviewed && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        markLabReviewed(l.id);
                        toast.success(t.labs.reviewed, "تم تعليم النتيجة كمراجَعة.");
                      }}
                    >
                      <Check className="size-4" /> {t.labs.markReviewed}
                    </Button>
                  )}
                  {l.tiedToDose && (
                    <Button onClick={() => navigate(`/patients/${fileNo}/dose`)}>
                      <Syringe className="size-4" /> {t.dose.approve}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
