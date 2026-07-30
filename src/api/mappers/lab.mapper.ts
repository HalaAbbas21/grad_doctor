import type { RawLabResult, RawLabTestRequest, RawSampleDraw } from "@/api/types/raw";
import type { LabResult, LabTestRequest, SampleDraw } from "@/mock/types";

function mapSampleDraw(raw: RawSampleDraw | null): SampleDraw | null {
  if (!raw) return null;
  return {
    id: String(raw.id),
    status: raw.status,
    drawnAt: raw.drawn_at,
    sampleNotes: raw.sample_notes,
  };
}

/** `test_types` may be null — never assume an array. `patient_ref`/`sample_draw` are nested and may be null — guarded, never dereferenced. */
export function mapLabTestRequest(raw: RawLabTestRequest): LabTestRequest {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    requestedBy: String(raw.requested_by),
    requestedByName: raw.requested_by_name,
    laboratoryId: String(raw.laboratory_id),
    laboratoryName: raw.laboratory_name,
    labKind: raw.lab_kind,
    testTypes: raw.test_types ?? [],
    priority: raw.priority,
    clinicalIndication: raw.clinical_indication,
    treatmentStage: raw.treatment_stage,
    requestDate: raw.request_date,
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    preDose: raw.pre_dose,
    reviewed: raw.reviewed,
    reviewedAt: raw.reviewed_at,
    reviewedByDoctorId: raw.reviewed_by_doctor_id != null ? String(raw.reviewed_by_doctor_id) : null,
    sampleDraw: mapSampleDraw(raw.sample_draw),
    latestResultVersion: raw.latest_result_version,
  };
}

export function mapLabResult(raw: RawLabResult): LabResult {
  return {
    id: String(raw.id),
    requestId: String(raw.request_id),
    patientFileNo: raw.patient_file_no,
    laboratoryId: String(raw.laboratory_id),
    testType: raw.test_type,
    resultFilePath: raw.result_file_path,
    resultDate: raw.result_date,
    version: raw.version,
    isRead: raw.is_read,
    summary: raw.summary,
    uploadedByName: raw.uploaded_by_name,
  };
}
