import { apiClient } from "./client";
import { mapVitals } from "./mappers/vitals.mapper";
import type { RawVitals } from "./types/raw";

/** GET /patients/{fileNo}/vitals. Verified envelope is `{ data }` only — no pagination fields, same as notes/treatment-plans. */
export async function listVitals(patientFileNo: string) {
  const res = await apiClient.get<{ data: RawVitals[] }>(`/patients/${patientFileNo}/vitals`);
  return res.data.data.map(mapVitals);
}
