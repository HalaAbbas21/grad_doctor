import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPatients } from "@/api/patients.api";
import type { Department } from "@/constants/departments";

/**
 * Wraps GET /patients. `department` and `search` are applied client-side —
 * no server-side patient-search param is documented (only `perPage` is
 * verified), and department isn't a confirmed filter param either, so both
 * are filtered here rather than guessed as query params.
 * TODO(api-contract): confirm server-side patient search + department filter params.
 */
export function usePatients(params: { department?: Department; search?: string } = {}) {
  const { department, search } = params;

  const query = useQuery({
    queryKey: ["patients", "list"],
    queryFn: () => listPatients({ perPage: 15 }),
  });

  const allItems = query.data?.items ?? [];

  const departmentItems = useMemo(
    () => (department ? allItems.filter((p) => p.department === department) : allItems),
    [allItems, department]
  );

  const items = useMemo(() => {
    const q = search?.trim().toLowerCase();
    if (!q) return departmentItems;
    return departmentItems.filter(
      (p) => p.fileNoBasma.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q)
    );
  }, [departmentItems, search]);

  return {
    items,
    /** Department-filtered count, before the search box narrows it further — for empty-state messaging. */
    departmentCount: departmentItems.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
