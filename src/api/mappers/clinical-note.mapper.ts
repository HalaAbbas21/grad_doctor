import type { RawClinicalNote } from "@/api/types/raw";
import type { ClinicalNote } from "@/mock/types";

/**
 * `body`/`text` are duplicate fields with the same value while the backend
 * is mid-rename — map from `body`, falling back to `text` only if `body` is
 * missing. Never send `text` back on create — see createClinicalNote().
 */
export function mapClinicalNote(raw: RawClinicalNote): ClinicalNote {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    authorId: String(raw.author_id),
    authorName: raw.author_name,
    body: raw.body ?? raw.text ?? "",
    kind: raw.kind,
    createdAt: raw.created_at,
    lastEditedAt: raw.last_edited_at ?? null,
  };
}
