import { useQuery } from "@tanstack/react-query";
import { listTreatmentPlans } from "@/api/treatmentPlans.api";

/** Wraps GET /patients/{fileNo}/treatment-plans. */
export function useTreatmentPlans(patientFileNo: string) {
  return useQuery({
    queryKey: ["treatmentPlans", "list", patientFileNo],
    queryFn: () => listTreatmentPlans(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}
