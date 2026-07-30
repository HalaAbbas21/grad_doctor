import { useQuery } from "@tanstack/react-query";
import { listLaboratories } from "@/api/laboratories.api";

/** Wraps GET /laboratories. */
export function useLaboratories() {
  return useQuery({
    queryKey: ["laboratories", "list"],
    queryFn: listLaboratories,
  });
}
