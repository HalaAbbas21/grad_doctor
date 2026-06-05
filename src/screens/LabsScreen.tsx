import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton } from "@/components/ui/states";
import { SegmentedControl } from "@/components/ui/segmented";
import { PageHeader } from "@/components/PageHeader";
import { LabStatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { useMockLoad } from "@/hooks/useMockLoad";
import { formatDate } from "@/lib/utils";
import { testLabel } from "@/mock";
import { priorityLabel, t } from "@/i18n/ar";

type Filter = "all" | "to-review" | "external-new" | "pending";

export function LabsScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const labRequests = useAppStore((s) => s.labRequests);
  const patients = useAppStore((s) => s.patients);
  const { loading } = useMockLoad([]);

  const [filter, setFilter] = useState<Filter>(
    params.get("filter") === "external-new" ? "external-new" : "all"
  );

  const patientName = (fileNo: string) => {
    const p = patients.find((x) => x.fileNoBasma === fileNo);
    return p ? `${p.firstName} ${p.familyName}` : fileNo;
  };

  const list = useMemo(() => {
    let rows = [...labRequests];
    if (filter === "to-review")
      rows = rows.filter((l) => l.status === "results-available" && !l.reviewed);
    if (filter === "external-new") rows = rows.filter((l) => l.isExternalNew && !l.reviewed);
    if (filter === "pending") rows = rows.filter((l) => l.status === "pending");
    return rows.sort((a, b) => b.requestDate.localeCompare(a.requestDate));
  }, [labRequests, filter]);

  return (
    <div>
      <PageHeader title={t.nav.labs} subtitle="طلبات ونتائج الفحوص المخبرية" />

      <div className="mb-5">
        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t.common.all },
            { value: "to-review", label: t.dashboard.resultsToReview },
            { value: "external-new", label: "خارجية جديدة" },
            { value: "pending", label: "معلّقة" },
          ]}
        />
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : list.length === 0 ? (
        <EmptyState title="لا توجد فحوص مطابقة" />
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <Card
              key={l.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/patients/${l.patientFileNo}/results`)}
              className="cursor-pointer transition hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" className="font-mono">
                      <FileText className="size-3.5" />
                      {l.patientFileNo}
                    </Badge>
                    <span className="font-bold">{patientName(l.patientFileNo)}</span>
                    {l.isExternalNew && (
                      <Badge variant="secondary">
                        <Globe className="size-3.5" /> خارجي جديد
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {l.testTypes.map(testLabel).join("، ")} · {priorityLabel[l.priority]} · {formatDate(l.requestDate)}
                  </p>
                </div>
                <LabStatusBadge status={l.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
