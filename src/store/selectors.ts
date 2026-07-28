import { useAppStore } from "./useAppStore";

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
  const { patients, labRequests, documentations, pendingDischargeFileNos, consultRequests, department } =
    useAppStore();
  const inDept = (fileNo: string) =>
    patients.find((p) => p.fileNoBasma === fileNo)?.department === department;

  const resultsToReview = labRequests.filter(
    (l) => l.status === "results-available" && !l.reviewed && inDept(l.patientFileNo)
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

  const pendingConsults = consultRequests.filter(
    (c) => c.status === "pending" && inDept(c.patientFileNo)
  ).length;

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
