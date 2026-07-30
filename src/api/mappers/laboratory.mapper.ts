import type { RawLaboratory } from "@/api/types/raw";
import type { Laboratory } from "@/mock/types";

/** `id` is stringified here for display/consistency — write paths (POST /lab-test-requests) need the numeric id back, see labs.api.ts. */
export function mapLaboratory(raw: RawLaboratory): Laboratory {
  return {
    id: String(raw.id),
    name: raw.name,
    kind: raw.kind,
    supportedTests: raw.supported_tests ?? [],
    profileStatus: raw.profile_status,
  };
}
