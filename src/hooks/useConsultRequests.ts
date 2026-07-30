import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coordinateConsultRequest, listConsultRequests } from "@/api/consultRequests.api";
import type { ApiError } from "@/api/errors";
import type { ConsultRequest } from "@/mock/types";

/** Wraps GET /consult-requests, optionally scoped to a single patient. */
export function useConsultRequests(params: { patientFileNo?: string } = {}) {
  const { patientFileNo } = params;

  const query = useQuery({
    queryKey: ["consultRequests", "list", patientFileNo ?? "all"],
    queryFn: () => listConsultRequests({ patientFileNo, perPage: 15 }),
  });

  return {
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Wraps PATCH /consult-requests/{id}/coordinate. Invalidates every
 * consult-requests query on success (the unfiltered list, the dashboard
 * count, and any per-patient tab), not just the caller's own list, since a
 * coordinate action anywhere should refresh all of them.
 */
export function useCoordinateConsultRequest() {
  const queryClient = useQueryClient();
  return useMutation<ConsultRequest, ApiError, string>({
    mutationFn: (id: string) => coordinateConsultRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultRequests"] });
    },
  });
}
