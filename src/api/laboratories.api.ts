import { apiClient } from "./client";
import { mapLaboratory } from "./mappers/laboratory.mapper";
import type { RawLaboratory } from "./types/raw";

/** GET /laboratories. Envelope is `{ data }` only — no pagination fields. */
export async function listLaboratories() {
  const res = await apiClient.get<{ data: RawLaboratory[] }>("/laboratories");
  return res.data.data.map(mapLaboratory);
}
