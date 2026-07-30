import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTreatmentPlan, listTreatmentPlans } from "@/api/treatmentPlans.api";
import type { ApiError } from "@/api/errors";
import type { CreateTreatmentPlanPayload, TreatmentPlan } from "@/mock/types";

/** Wraps GET /patients/{fileNo}/treatment-plans. */
export function useTreatmentPlans(patientFileNo: string) {
  return useQuery({
    queryKey: ["treatmentPlans", "list", patientFileNo],
    queryFn: () => listTreatmentPlans(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}

/**
 * Wraps POST /treatment-plans. No optimistic insert — invalidates the
 * `treatmentPlans` prefix on success so the خطة العلاج tab refetches and
 * shows the new plan.
 */
export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();
  return useMutation<TreatmentPlan, ApiError, CreateTreatmentPlanPayload>({
    mutationFn: (payload) => createTreatmentPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
    },
  });
}
