import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ListSkeleton } from "@/components/ui/states";
import { PageHeader } from "@/components/PageHeader";
import { PatientRow } from "@/components/PatientRow";
import { useAppStore } from "@/store/useAppStore";
import { useMockLoad } from "@/hooks/useMockLoad";
import { departmentLabel, queueStatusLabel, t } from "@/i18n/ar";
import type { PatientQueueStatus } from "@/mock/types";

type SortKey = "token" | "waiting" | "name";

export function PatientsScreen() {
  const { patients, department, documentations, pendingDischargeFileNos } = useAppStore();
  const [params] = useSearchParams();
  const filterParam = params.get("filter");
  const { loading } = useMockLoad([department]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientQueueStatus | "all">(
    filterParam === "awaiting-dose-approval" ? "awaiting-dose-approval" : "all"
  );
  const [sort, setSort] = useState<SortKey>("token");

  const draftFileNos = useMemo(
    () => new Set(documentations.filter((d) => d.status === "draft").map((d) => d.patientFileNo)),
    [documentations]
  );

  const list = useMemo(() => {
    let rows = patients.filter((p) => p.department === department);

    // Deep-link filters from the dashboard
    if (filterParam === "drafts") rows = rows.filter((p) => draftFileNos.has(p.fileNoBasma));
    if (filterParam === "discharge")
      rows = rows.filter((p) => pendingDischargeFileNos.includes(p.fileNoBasma));

    if (statusFilter !== "all") rows = rows.filter((p) => p.queueStatus === statusFilter);

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (p) =>
          p.fileNoBasma.toLowerCase().includes(q) ||
          p.fileNoBiruni.toLowerCase().includes(q) ||
          `${p.firstName} ${p.familyName}`.toLowerCase().includes(q)
      );
    }

    rows = [...rows].sort((a, b) => {
      if (sort === "name") return `${a.firstName}`.localeCompare(`${b.firstName}`, "ar");
      if (sort === "waiting")
        return (a.waitingSince ?? "9").localeCompare(b.waitingSince ?? "9");
      return (a.tokenNumber ?? 99) - (b.tokenNumber ?? 99);
    });
    return rows;
  }, [patients, department, filterParam, statusFilter, query, sort, draftFileNos, pendingDischargeFileNos]);

  const filterTitle =
    filterParam === "drafts"
      ? t.dashboard.incompleteDrafts
      : filterParam === "discharge"
        ? t.dashboard.pendingDischarge
        : t.nav.patients;

  return (
    <div>
      <PageHeader title={filterTitle} subtitle={`${departmentLabel[department]} · ${list.length} مريض`} />

      {/* Search + filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.common.searchByFileNo}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PatientQueueStatus | "all")}>
            <SelectTrigger className="w-40">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {(Object.keys(queueStatusLabel) as PatientQueueStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {queueStatusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="token">{t.common.token}</SelectItem>
              <SelectItem value="waiting">{t.common.waitingTime}</SelectItem>
              <SelectItem value="name">{t.common.name}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : list.length === 0 ? (
        <EmptyState title="لا يوجد مرضى مطابقون" description="جرّب تعديل البحث أو عوامل التصفية." />
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <PatientRow key={p.fileNoBasma} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
