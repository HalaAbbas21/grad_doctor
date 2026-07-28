import { apiClient } from "./client";
import { unwrapList, type RawPaginatedList } from "./pagination";
import { mapAppointment } from "./mappers/appointment.mapper";
import type { RawAppointment } from "./types/raw";
import type { Department } from "@/constants/departments";

/**
 * GET /appointments. Filters by department, not doctor — few doctors rotate
 * across patients constantly, so department is the stable unit of work, not
 * doctor_id (which this deliberately never sends).
 * TODO(api-contract): confirm the API accepts ?department= as an appointments
 * filter — only doctor_id was shown in the verified collection response, so
 * this param is assumed, not verified. useAppointments() also applies a
 * client-side department filter as a safety net regardless of server support.
 */
export async function listAppointments(params?: { department?: Department; perPage?: number }) {
  const res = await apiClient.get<RawPaginatedList<RawAppointment>>("/appointments", {
    params: { perPage: params?.perPage ?? 15, department: params?.department },
  });
  return unwrapList(res.data, mapAppointment);
}
