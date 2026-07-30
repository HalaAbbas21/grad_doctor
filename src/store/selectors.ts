import { useAppStore } from "./useAppStore";
import { useConsultRequests } from "@/hooks/useConsultRequests";
import { useLabRequests } from "@/hooks/useLabs";

export interface DashboardCounts {
  resultsToReview: number;
  dosesToApprove: number;
  incompleteDrafts: number;
  pendingDischarge: number;
  newExternalResults: number;
  pendingConsults: number;
}

/** Live dashboard priority-row counts, scoped to the active department. */
export function useDashboardCounts(): DashboardCounts {
  const { patients, labRequests, documentations, pendingDischargeFileNos, department } = useAppStore();
  const { items: consultRequests } = useConsultRequests();
  const { data: realLabRequests } = useLabRequests();
  const inDept = (fileNo: string) =>
    patients.find((p) => p.fileNoBasma === fileNo)?.department === department;

  // Real data (GET /lab-test-requests, unfiltered) — not scoped to
  // department, same reasoning as pendingConsults below.
  // TODO(api-contract): confirm "awaiting review" means status ===
  // "results_available" && reviewed === false — the most literal reading of
  // "results arrived but the doctor hasn't reviewed them yet".
  const resultsToReview = (realLabRequests ?? []).filter(
    (l) => l.status === "results_available" && !l.reviewed
  ).length;

  const dosesToApprove = patients.filter(
    (p) => p.department === department && p.queueStatus === "awaiting-dose-approval"
  ).length;

  const incompleteDrafts = documentations.filter(
    (d) => d.status === "draft" && inDept(d.patientFileNo)
  ).length;

  const pendingDischarge = pendingDischargeFileNos.filter(inDept).length;

  const newExternalResults = labRequests.filter(
    (l) => l.isExternalNew && !l.reviewed && inDept(l.patientFileNo)
  ).length;

  // Real data (GET /consult-requests) — not scoped to department, since no
  // department filter/field relationship for this endpoint is confirmed.
  const pendingConsults = consultRequests.filter((c) => c.status === "pending").length;

  return {
    resultsToReview,
    dosesToApprove,
    incompleteDrafts,
    pendingDischarge,
    newExternalResults,
    pendingConsults,
  };
}

export function useUnreadCount(): number {
  return useAppStore((s) => s.notifications.filter((n) => !n.isRead).length);
}
