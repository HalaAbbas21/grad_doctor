import { useQuery } from "@tanstack/react-query";
import { listQueues } from "@/api/queues.api";
import type { Department } from "@/constants/departments";

/** Wraps GET /queues?department=. Returns the raw department queue — callers filter further (e.g. by status or by date) for their specific need. */
export function useQueues(department: Department) {
  const query = useQuery({
    queryKey: ["queues", "list", department],
    queryFn: () => listQueues(department),
  });

  return {
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
