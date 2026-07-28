import { isDepartment } from "@/constants/departments";
import type { RawQueueItem } from "@/api/types/raw";
import type { QueueItem } from "@/mock/types";

/**
 * `number` is a string token (e.g. "D-12") — passed through as-is, never
 * parsed as a number. `status` is passed through as-is (open string) — see
 * the TODO(api-contract) on `QueueItem` in mock/types.ts.
 */
export function mapQueueItem(raw: RawQueueItem): QueueItem {
  return {
    id: String(raw.id),
    number: raw.number,
    patientFileNo: raw.patient_file_no,
    patientName: raw.patient_name,
    department: isDepartment(raw.department) ? raw.department : null,
    queueDate: raw.queue_date,
    issueTime: raw.issue_time,
    status: raw.status,
    isEmergency: raw.is_emergency,
    visibleToGuardian: raw.visible_to_guardian,
    pendingData: raw.pending_data,
  };
}
