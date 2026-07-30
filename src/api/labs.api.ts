import { apiClient } from "./client";
import { mapLabResult, mapLabTestRequest } from "./mappers/lab.mapper";
import type { RawLabResult, RawLabTestRequest } from "./types/raw";

/**
 * GET /lab-test-requests, optionally filtered by patient_file_no. Envelope
 * is `{ data }` only — no pagination fields.
 * TODO(api-contract): only the patient_file_no-filtered call is verified —
 * calling this with no patientFileNo (for the Home "awaiting review" count,
 * which needs every patient's requests) assumes the endpoint also supports
 * an unfiltered listing; untested.
 */
export async function listLabRequests(patientFileNo?: string) {
  const res = await apiClient.get<{ data: RawLabTestRequest[] }>("/lab-test-requests", {
    params: { patient_file_no: patientFileNo },
  });
  return res.data.data.map(mapLabTestRequest);
}

/** GET /lab-results?patient_file_no=. Envelope is `{ data }` only — no pagination fields. */
export async function listLabResults(patientFileNo: string) {
  const res = await apiClient.get<{ data: RawLabResult[] }>("/lab-results", {
    params: { patient_file_no: patientFileNo },
  });
  return res.data.data.map(mapLabResult);
}

export interface CreateLabTestRequestPayload {
  patientFileNo: string;
  /** Numeric on the wire, per the raw laboratory id — not stringified like the rest of this app's ids. */
  laboratoryId: number;
  testTypes: string[];
  priority: string;
  clinicalIndication?: string;
}

/** POST /lab-test-requests. */
export async function createLabTestRequest(payload: CreateLabTestRequestPayload) {
  const res = await apiClient.post<RawLabTestRequest>("/lab-test-requests", {
    patient_file_no: payload.patientFileNo,
    laboratory_id: payload.laboratoryId,
    test_types: payload.testTypes,
    priority: payload.priority,
    clinical_indication: payload.clinicalIndication,
  });
  return mapLabTestRequest(res.data);
}
