import { apiClient } from "./client";
import { mapDoctorProfile } from "./mappers/doctor-profile.mapper";
import type { RawDoctorProfile } from "./types/raw";

/** GET /doctor/profile — camelCase on the wire already, unlike every other endpoint in this app. */
export async function getDoctorProfile() {
  const res = await apiClient.get<RawDoctorProfile>("/doctor/profile");
  return mapDoctorProfile(res.data);
}
