import { apiClient } from "./client";
import { unwrapList, type RawPaginatedList } from "./pagination";
import { mapConsultRequest } from "./mappers/consult-request.mapper";
import type { RawConsultRequest } from "./types/raw";

/** GET /consult-requests. Supports an optional patient_file_no filter for the patient-record tab. */
export async function listConsultRequests(params?: { patientFileNo?: string; perPage?: number }) {
  const res = await apiClient.get<RawPaginatedList<RawConsultRequest>>("/consult-requests", {
    params: { perPage: params?.perPage ?? 15, patient_file_no: params?.patientFileNo },
  });
  return unwrapList(res.data, mapConsultRequest);
}

/** PATCH /consult-requests/{id}/coordinate — moves a request from pending to coordinated. */
export async function coordinateConsultRequest(id: string) {
  const res = await apiClient.patch<RawConsultRequest>(`/consult-requests/${id}/coordinate`);
  return mapConsultRequest(res.data);
}
