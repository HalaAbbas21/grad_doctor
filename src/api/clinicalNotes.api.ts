import { apiClient } from "./client";
import { unwrapList, type RawPaginatedList } from "./pagination";
import { mapClinicalNote } from "./mappers/clinical-note.mapper";
import type { RawClinicalNote } from "./types/raw";

/**
 * GET /clinical-notes?patient_file_no=. The verified response envelope here
 * is just `{ data }` — no page/perPage/lastPage/total. unwrapList tolerates
 * this (it only ever reads `.data`); only `.items` is consumed by callers,
 * never the pagination metadata, since it isn't confirmed to exist for this endpoint.
 */
export async function listClinicalNotes(patientFileNo: string) {
  const res = await apiClient.get<RawPaginatedList<RawClinicalNote>>("/clinical-notes", {
    params: { patient_file_no: patientFileNo },
  });
  return unwrapList(res.data, mapClinicalNote);
}

/** POST /clinical-notes. Sends only `patient_file_no` + `body` — never `text`, which is the field being phased out. */
export async function createClinicalNote(patientFileNo: string, body: string) {
  const res = await apiClient.post<RawClinicalNote>("/clinical-notes", {
    patient_file_no: patientFileNo,
    body,
  });
  return mapClinicalNote(res.data);
}
