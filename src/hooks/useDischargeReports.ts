import { useQuery } from "@tanstack/react-query";
import { listDischargeReports } from "@/api/dischargeReports.api";

/** Wraps GET /discharge-reports?patient_file_no=. */
export function useDischargeReports(patientFileNo: string) {
  return useQuery({
    queryKey: ["dischargeReports", "list", patientFileNo],
    queryFn: () => listDischargeReports(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}
