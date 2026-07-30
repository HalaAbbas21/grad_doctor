import { useQuery } from "@tanstack/react-query";
import { getDoctorProfile } from "@/api/doctorProfile.api";

/** Wraps GET /doctor/profile — a separate, richer profile source than auth.store's user (/auth/me). */
export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctorProfile"],
    queryFn: getDoctorProfile,
  });
}
