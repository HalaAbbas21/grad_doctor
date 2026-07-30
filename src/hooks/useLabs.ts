import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLabTestRequest,
  listLabRequests,
  listLabResults,
  reviewLabRequest,
  type CreateLabTestRequestPayload,
} from "@/api/labs.api";
import type { ApiError } from "@/api/errors";
import type { LabTestRequest } from "@/mock/types";

/**
 * Wraps GET /lab-test-requests. Pass a patientFileNo to scope to one
 * patient (the labs tab); omit it for every request (the Home "awaiting
 * review" count) — see the TODO(api-contract) on listLabRequests().
 */
export function useLabRequests(patientFileNo?: string) {
  return useQuery({
    queryKey: ["labTestRequests", "list", patientFileNo ?? "all"],
    queryFn: () => listLabRequests(patientFileNo),
  });
}

/** Wraps GET /lab-results?patient_file_no=. */
export function useLabResults(patientFileNo: string) {
  return useQuery({
    queryKey: ["labResults", "list", patientFileNo],
    queryFn: () => listLabResults(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}

/**
 * Wraps POST /lab-test-requests. No optimistic insert — invalidates every
 * `labTestRequests` query on success (the patient's own labs tab and the
 * unfiltered query behind the Home "awaiting review" count) via the same
 * prefix-match pattern used for appointments/consult-requests.
 */
export function useCreateLabTestRequest() {
  const queryClient = useQueryClient();
  return useMutation<LabTestRequest, ApiError, CreateLabTestRequestPayload>({
    mutationFn: (payload) => createLabTestRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labTestRequests"] });
    },
  });
}

/**
 * Wraps PATCH /lab-test-requests/{id}/review. No optimistic update —
 * invalidates the same `labTestRequests` prefix as useCreateLabTestRequest
 * on success (the patient's labs tab + the Home "awaiting review" count).
 * The server rejects a request that isn't status === "results_available" yet
 * (422) — callers must gate the button on that status client-side; this
 * mutation doesn't re-check it.
 */
export function useReviewLabRequest() {
  const queryClient = useQueryClient();
  return useMutation<LabTestRequest, ApiError, string>({
    mutationFn: (id: string) => reviewLabRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labTestRequests"] });
    },
  });
}
