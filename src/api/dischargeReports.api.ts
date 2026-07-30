import { apiClient } from "./client";
import { mapDischargeReport } from "./mappers/discharge-report.mapper";
import type { RawDischargeReport } from "./types/raw";

/** GET /discharge-reports?patient_file_no=. Envelope is `{ data }` only — no pagination fields. The patient_file_no filter is server-confirmed (verified against the unfiltered call too). */
export async function listDischargeReports(patientFileNo: string) {
  const res = await apiClient.get<{ data: RawDischargeReport[] }>("/discharge-reports", {
    params: { patient_file_no: patientFileNo },
  });
  return res.data.data.map(mapDischargeReport);
}
