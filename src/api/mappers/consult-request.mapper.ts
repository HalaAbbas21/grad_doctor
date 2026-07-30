import type { RawConsultRequest } from "@/api/types/raw";
import type { ConsultationType, ConsultRequest } from "@/mock/types";

const KNOWN_CONSULTATION_TYPES: ConsultationType[] = [
  "cardiac",
  "neurological",
  "ophthalmic",
  "ent",
  "surgery",
  "other",
];

/** Falls back to "other" (an existing, neutral ConsultationType member) rather than crash on an unconfirmed one. */
function mapConsultationType(raw: string): ConsultationType {
  return (KNOWN_CONSULTATION_TYPES as string[]).includes(raw) ? (raw as ConsultationType) : "other";
}

/** `status` is passed through as-is (open string) — see the TODO(api-contract) on `ConsultRequest` in mock/types.ts. */
export function mapConsultRequest(raw: RawConsultRequest): ConsultRequest {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    consultationType: mapConsultationType(raw.consultation_type),
    notes: raw.notes,
    status: raw.status,
    requestedBy: String(raw.requested_by),
    createdAt: raw.created_at,
  };
}
