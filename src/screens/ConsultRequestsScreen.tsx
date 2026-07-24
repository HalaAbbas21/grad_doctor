import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, FileText, Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ConsultTypeBadge } from "@/components/consult-type-badge";
import { ConsultStatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { useMockLoad } from "@/hooks/useMockLoad";
import { formatDate } from "@/lib/utils";
import { consultTypeLabel, t } from "@/i18n/ar";
import type { ConsultationType, ConsultRequest, ConsultRequestStatus } from "@/mock/types";

export function ConsultRequestsScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const { patients, consultRequests, department, coordinateConsultRequest } = useAppStore();
  const { loading, error, reload } = useMockLoad([department]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConsultRequestStatus | "all">(
    params.get("filter") === "all" ? "all" : "pending"
  );
  const [typeFilter, setTypeFilter] = useState<ConsultationType | "all">("all");
  const [target, setTarget] = useState<ConsultRequest | null>(null);

  const patientOf = (fileNo: string) => patients.find((p) => p.fileNoBasma === fileNo);

  const list = useMemo(() => {
    let rows = consultRequests.filter((c) => patientOf(c.patientFileNo)?.department === department);

    if (statusFilter !== "all") rows = rows.filter((c) => c.status === statusFilter);
    if (typeFilter !== "all") rows = rows.filter((c) => c.consultationType === typeFilter);

    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((c) => c.patientFileNo.toLowerCase().includes(q));

    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultRequests, patients, department, statusFilter, typeFilter, query]);

  const confirmCoordinate = () => {
    if (!target) return;
    coordinateConsultRequest(target.id);
    const p = patientOf(target.patientFileNo);
    toast.success(t.consult.coordinated, `${p ? `${p.firstName} ${p.familyName}` : target.patientFileNo} · ${consultTypeLabel[target.consultationType]}`);
    setTarget(null);
  };

  return (
    <div>
      <PageHeader title={t.consult.title} subtitle={t.consult.pendingCount} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.consult.searchByFileNo}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ConsultationType | "all")}>
            <SelectTrigger className="w-40">
              <span className="flex items-center gap-2">
                <Stethoscope className="size-4 text-muted-foreground" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {(Object.keys(consultTypeLabel) as ConsultationType[]).map((ct) => (
                <SelectItem key={ct} value={ct}>
                  {consultTypeLabel[ct]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ConsultRequestStatus | "all")}>
            <SelectTrigger className="w-40">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="pending">{t.consult.pending}</SelectItem>
              <SelectItem value="coordinated">{t.consult.coordinated}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState tone="success" title={t.consult.empty} />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const p = patientOf(c.patientFileNo);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" className="font-mono">
                        <FileText className="size-3.5" />
                        {c.patientFileNo}
                      </Badge>
                      {p && (
                        <button
                          onClick={() => navigate(`/patients/${c.patientFileNo}`)}
                          className="font-bold text-foreground hover:text-primary hover:underline"
                        >
                          {p.firstName} {p.familyName}
                        </button>
                      )}
                      <ConsultTypeBadge type={c.consultationType} />
                    </div>
                    {c.notes && <p className="mt-1.5 truncate text-sm text-muted-foreground">{c.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.consult.requestDate}: {formatDate(c.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <ConsultStatusBadge status={c.status} />
                    {c.status === "pending" && (
                      <Button size="sm" onClick={() => setTarget(c)}>
                        <Check className="size-4" /> {t.consult.coordinate}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={target != null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={t.consult.coordinate}
        description={target ? `${patientOf(target.patientFileNo)?.firstName ?? ""} ${patientOf(target.patientFileNo)?.familyName ?? ""} · ${target.patientFileNo}` : undefined}
        confirmLabel={t.consult.coordinate}
        onConfirm={confirmCoordinate}
      >
        {target && (
          <div className="rounded-xl bg-muted/60 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold">
              <Stethoscope className="size-4 text-primary" />
              {consultTypeLabel[target.consultationType]}
            </p>
            <p className="mt-1 text-muted-foreground">{t.consult.coordinateConfirm}</p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
