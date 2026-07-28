import type { RawPhaseMedication, RawTreatmentPhase, RawTreatmentPlan } from "@/api/types/raw";
import type { PhaseMedication, TreatmentPhase, TreatmentPlan } from "@/mock/types";

export function mapMedication(raw: RawPhaseMedication): PhaseMedication {
  return {
    id: String(raw.id),
    name: raw.name,
    dose: raw.dose,
    schedule: raw.schedule,
  };
}

/** `status` is passed through as-is (open string) — see the TODO(api-contract) on `TreatmentPhase` in mock/types.ts. */
export function mapPhase(raw: RawTreatmentPhase): TreatmentPhase {
  return {
    id: String(raw.id),
    stageName: raw.stage_name,
    startDate: raw.start_date,
    endDate: raw.end_date,
    description: raw.description,
    procedures: raw.procedures,
    cycles: raw.cycles,
    visits: raw.visits,
    milestones: raw.milestones,
    status: raw.status,
    medications: (raw.medications ?? []).map(mapMedication),
  };
}

export function mapTreatmentPlan(raw: RawTreatmentPlan): TreatmentPlan {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    doctorId: String(raw.doctor_id),
    planName: raw.plan_name,
    startDate: raw.start_date,
    estimatedEndDate: raw.estimated_end_date,
    overallDescription: raw.overall_description,
    phases: (raw.phases ?? []).map(mapPhase),
  };
}
