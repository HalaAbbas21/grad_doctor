import type { RawDoseApproval } from "@/api/types/raw";
import type { DoseApproval } from "@/mock/types";

/**
 * `recommended_dose` arrives as `""` (empty string) rather than `null` when
 * there's nothing to recommend — this empty-string-means-absent convention
 * is unique to this endpoint, so it's normalized explicitly here rather than
 * through a generic null-coalescing helper.
 */
export function mapDoseApproval(raw: RawDoseApproval): DoseApproval {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    doctorId: String(raw.doctor_id),
    stageRef: raw.stage_ref,
    treatmentStageId: raw.treatment_stage_id != null ? String(raw.treatment_stage_id) : null,
    labTestRequestId: String(raw.lab_test_request_id),
    cycle: raw.cycle,
    lastDoseDate: raw.last_dose_date,
    recommendedDose: raw.recommended_dose || null,
    approvedDose: raw.approved_dose,
    adjusted: raw.adjusted,
    adjustmentReason: raw.adjustment_reason,
    notes: raw.notes,
    status: raw.status,
    approvedAt: raw.approved_at,
    marItemId: raw.mar_item_id != null ? String(raw.mar_item_id) : null,
  };
}
