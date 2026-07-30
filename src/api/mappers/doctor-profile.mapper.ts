import { isDepartment } from "@/constants/departments";
import type { RawDoctorProfile } from "@/api/types/raw";
import type { DoctorProfile } from "@/mock/types";

/**
 * Thin pass-through — this endpoint is already camelCase on the wire, unlike
 * every other endpoint in this app. No snake_case conversion, no id
 * stringify (it's already a string). Only `currentDepartment` needs actual
 * validation.
 */
export function mapDoctorProfile(raw: RawDoctorProfile): DoctorProfile {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    specialization: raw.specialization,
    professionalStatus: raw.professionalStatus,
    professionalId: raw.professionalId,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
    currentDepartment: isDepartment(raw.currentDepartment) ? raw.currentDepartment : null,
  };
}
