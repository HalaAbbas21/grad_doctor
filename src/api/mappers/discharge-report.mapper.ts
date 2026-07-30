import { isDepartment } from "@/constants/departments";
import type { RawDischargeReport } from "@/api/types/raw";
import type { DischargeReport } from "@/mock/types";

/** `prescription` may be null — never assume an array. */
export function mapDischargeReport(raw: RawDischargeReport): DischargeReport {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    doctorId: String(raw.doctor_id),
    stageRef: raw.stage_ref,
    lastDoseDate: raw.last_dose_date,
    prescription: raw.prescription ?? [],
    doctorInstructions: raw.doctor_instructions,
    nextDoseDate: raw.next_dose_date,
    nextVisitDepartment: isDepartment(raw.next_visit_department) ? raw.next_visit_department : null,
    generatedAt: raw.generated_at,
    exportable: raw.exportable,
  };
}
