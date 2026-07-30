import { apiClient } from "./client";
import { mapTreatmentPlan } from "./mappers/treatment-plan.mapper";
import type { RawTreatmentPlan } from "./types/raw";
import type { CreateTreatmentPlanPayload } from "@/mock/types";

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

/**
 * POST /treatment-plans. The request body's phase array is keyed `stages`
 * (not `phases`, unlike the response/read shape) — a real, confirmed
 * asymmetry, not normalized away here. Response is mapped through the same
 * mapTreatmentPlan used by the read side.
 */
export async function createTreatmentPlan(payload: CreateTreatmentPlanPayload) {
  const res = await apiClient.post<RawTreatmentPlan>("/treatment-plans", {
    patient_file_no: payload.patientFileNo,
    plan_name: payload.planName,
    start_date: payload.startDate,
    stages: payload.stages.map((stage) => ({
      stage_name: stage.stageName,
      start_date: stage.startDate,
      status: stage.status,
      medications: stage.medications.map((m) => ({
        name: m.name,
        dose: m.dose,
        schedule: m.schedule,
      })),
    })),
  });
  return mapTreatmentPlan(res.data);
}
