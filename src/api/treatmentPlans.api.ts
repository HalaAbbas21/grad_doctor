import { apiClient } from "./client";
import { mapTreatmentPlan } from "./mappers/treatment-plan.mapper";
import type { RawTreatmentPlan } from "./types/raw";

/**
 * GET /patients/{file_no}/treatment-plans. Verified envelope: `{ data: [] }`
 * when empty — `data` is an array of plan objects (a patient can have more
 * than one plan), each with the full nested phases/medications shape.
 */
export async function listTreatmentPlans(patientFileNo: string) {
  const res = await apiClient.get<{ data: RawTreatmentPlan[] }>(
    `/patients/${patientFileNo}/treatment-plans`
  );
  return res.data.data.map(mapTreatmentPlan);
}
