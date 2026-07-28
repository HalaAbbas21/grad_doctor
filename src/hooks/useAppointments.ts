import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAppointments } from "@/api/appointments.api";
import { damascusDateKey } from "@/lib/utils";
import type { Department } from "@/constants/departments";

/**
 * Wraps GET /appointments. Filters by department (not doctor) client-side as
 * a safety net — see the TODO(api-contract) on listAppointments() for whether
 * the server honors ?department=.
 * "Today" is also computed client-side against Asia/Damascus, since no
 * date/today filter param is confirmed.
 * TODO(api-contract): confirm a date/today filter param exists server-side.
 */
export function useAppointments(params: { department?: Department } = {}) {
  const { department } = params;

  const query = useQuery({
    queryKey: ["appointments", "list", department],
    queryFn: () => listAppointments({ department, perPage: 15 }),
  });

  const allItems = query.data?.items ?? [];

  const departmentItems = useMemo(
    () => (department ? allItems.filter((a) => a.department === department) : allItems),
    [allItems, department]
  );

  const todayItems = useMemo(() => {
    const todayKey = damascusDateKey(new Date().toISOString());
    return departmentItems.filter((a) => damascusDateKey(a.scheduledAt) === todayKey);
  }, [departmentItems]);

  return {
    items: todayItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
