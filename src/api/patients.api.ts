import { apiClient } from "./client";
import { unwrapList, type RawPaginatedList } from "./pagination";
import { mapPatientDetail, mapPatientListItem } from "./mappers/patient.mapper";
import type { RawPatientDetail, RawPatientListItem } from "./types/raw";

export async function listPatients(params?: { perPage?: number }) {
  const res = await apiClient.get<RawPaginatedList<RawPatientListItem>>("/patients", {
    params: { perPage: params?.perPage ?? 15 },
  });
  return unwrapList(res.data, mapPatientListItem);
}

/** GET /patients/{file_no_basma}. A 404 (patient not found) surfaces as a normal ApiError — see toApiError. */
export async function getPatient(fileNo: string) {
  const res = await apiClient.get<RawPatientDetail>(`/patients/${fileNo}`);
  return mapPatientDetail(res.data);
}
