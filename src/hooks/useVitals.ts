import { useQuery } from "@tanstack/react-query";
import { listVitals } from "@/api/vitals.api";

/** Wraps GET /patients/{fileNo}/vitals. */
export function useVitals(patientFileNo: string) {
  return useQuery({
    queryKey: ["vitals", "list", patientFileNo],
    queryFn: () => listVitals(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}
