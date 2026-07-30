import { apiClient } from "./client";
import { mapDoseApproval } from "./mappers/dose-approval.mapper";
import type { RawDoseApproval } from "./types/raw";
import type { ApproveDosePayload, PrepareDoseApprovalPayload } from "@/mock/types";

/**
 * POST /dose-approvals — step 1, "prepare." The verified request body sends
 * lab_test_request_id as a JSON number (`3`), not a string — even though
 * LabTestRequest.id is a stringified id everywhere else in this app for
 * display. Converted here at the write boundary, same as laboratory_id in
 * createLabTestRequest().
 */
export async function prepareDoseApproval(payload: PrepareDoseApprovalPayload) {
  const res = await apiClient.post<RawDoseApproval>("/dose-approvals", {
    patient_file_no: payload.patientFileNo,
    lab_test_request_id: Number(payload.labTestRequestId),
  });
  return mapDoseApproval(res.data);
}

/** PATCH /dose-approvals/{id}/approve — step 2, "approve." `route` is write-only, never echoed back. */
export async function approveDose(id: string, payload: ApproveDosePayload) {
  const res = await apiClient.patch<RawDoseApproval>(`/dose-approvals/${id}/approve`, {
    approved_dose: payload.approvedDose,
    route: payload.route,
  });
  return mapDoseApproval(res.data);
}
