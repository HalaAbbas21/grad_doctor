import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveDose, prepareDoseApproval } from "@/api/doseApprovals.api";
import type { ApiError } from "@/api/errors";
import type { ApproveDosePayload, DoseApproval, PrepareDoseApprovalPayload } from "@/mock/types";

/**
 * Wraps POST /dose-approvals — step 1. No optimistic update, ever: the
 * caller must not treat a request as prepared until this resolves.
 */
export function usePrepareDoseApproval() {
  return useMutation<DoseApproval, ApiError, PrepareDoseApprovalPayload>({
    mutationFn: (payload) => prepareDoseApproval(payload),
  });
}

/**
 * Wraps PATCH /dose-approvals/{id}/approve — step 2. No optimistic update,
 * ever: never show "approved" before the server confirms it. On success,
 * invalidates `labTestRequests` (the lab request's dose relationship may now
 * be reflected) and `doseApprovals`/`marItems` prefixes as a forward-looking
 * measure — no existing query currently reads under either of the latter two
 * (this screen calls the mutations directly, doesn't list past approvals via
 * a query), but invalidating them now costs nothing and covers a future
 * dose-approval list view without needing to remember to add it then.
 */
export function useApproveDose() {
  const queryClient = useQueryClient();
  return useMutation<DoseApproval, ApiError, { id: string; payload: ApproveDosePayload }>({
    mutationFn: ({ id, payload }) => approveDose(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labTestRequests"] });
      queryClient.invalidateQueries({ queryKey: ["doseApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["marItems"] });
    },
  });
}
