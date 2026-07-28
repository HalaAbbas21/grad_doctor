import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { PatientListRow } from "@/components/PatientListRow";
import { useAppStore } from "@/store/useAppStore";
import { usePatients } from "@/hooks/usePatients";
import { departmentLabel, t } from "@/i18n/ar";

type SortKey = "name" | "registrationDate";

export function PatientsScreen() {
  const department = useAppStore((s) => s.department);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  const { items, departmentCount, isLoading, isError, refetch } = usePatients({
    department,
    search: query,
  });

  const list = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sort === "registrationDate") return b.registrationDate.localeCompare(a.registrationDate);
      return a.fullName.localeCompare(b.fullName, "ar");
    });
  }, [items, sort]);

  return (
    <div>
      <PageHeader title={t.nav.patients} subtitle={`${departmentLabel[department]} · ${list.length} مريض`} />

      {/* Search + sort */}
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
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t.common.name}</SelectItem>
            <SelectItem value="registrationDate">{t.common.date}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        departmentCount === 0 ? (
          <EmptyState tone="success" title={t.patient.noPatientsInDepartment} />
        ) : (
          <EmptyState title={t.patient.noPatientsMatching} description={t.patient.adjustSearch} />
        )
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <PatientListRow key={p.fileNoBasma} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
