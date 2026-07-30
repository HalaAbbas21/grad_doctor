import { isDepartment } from "@/constants/departments";
import type { RawAppointment } from "@/api/types/raw";
import type { Appointment } from "@/mock/types";

/**
 * `type`/`status` are passed through as-is (open strings) rather than
 * validated against a closed union — see the TODO(api-contract) on
 * `Appointment` in mock/types.ts for the values observed so far.
 * `scheduled_at` is kept as the raw ISO string; splitting it into a
 * date and a time is a render-time concern, not a mapping concern.
 */
export function mapAppointment(raw: RawAppointment): Appointment {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    patientName: raw.patient_name,
    department: isDepartment(raw.department) ? raw.department : null,
    doctorId: String(raw.doctor_id),
    doctorName: raw.doctor_name,
    scheduledAt: raw.scheduled_at,
    type: raw.type,
    status: raw.status,
    notes: raw.notes,
    cancelledBy: raw.cancelled_by != null ? String(raw.cancelled_by) : null,
    cancelledAt: raw.cancelled_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
