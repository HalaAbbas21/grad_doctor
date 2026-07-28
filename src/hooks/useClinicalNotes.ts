import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClinicalNote, listClinicalNotes } from "@/api/clinicalNotes.api";
import type { ApiError } from "@/api/errors";
import type { ClinicalNote } from "@/mock/types";

function notesQueryKey(patientFileNo: string) {
  return ["clinicalNotes", "list", patientFileNo] as const;
}

/** Wraps GET /clinical-notes?patient_file_no=. */
export function useClinicalNotes(patientFileNo: string) {
  return useQuery({
    queryKey: notesQueryKey(patientFileNo),
    queryFn: () => listClinicalNotes(patientFileNo),
    enabled: Boolean(patientFileNo),
  });
}

/** Wraps POST /clinical-notes. Invalidates the list query on success so the new note appears immediately. */
export function useCreateClinicalNote(patientFileNo: string) {
  const queryClient = useQueryClient();
  return useMutation<ClinicalNote, ApiError, string>({
    mutationFn: (body: string) => createClinicalNote(patientFileNo, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey(patientFileNo) });
    },
  });
}
