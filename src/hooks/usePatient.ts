import { useQuery } from "@tanstack/react-query";
import { getPatient } from "@/api/patients.api";
import type { ApiError } from "@/api/errors";
import type { Patient } from "@/mock/types";

/** Wraps GET /patients/{fileNo}. Errors are always ApiError — every apiClient rejection is normalized via toApiError. */
export function usePatient(fileNo: string) {
  return useQuery<Patient, ApiError>({
    queryKey: ["patients", "detail", fileNo],
    queryFn: () => getPatient(fileNo),
    enabled: Boolean(fileNo),
  });
}
