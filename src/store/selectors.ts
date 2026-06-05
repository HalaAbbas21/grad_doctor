import { useAppStore } from "./useAppStore";
import type { Patient } from "@/mock/types";

export interface DashboardCounts {
  resultsToReview: number;
  dosesToApprove: number;
  incompleteDrafts: number;
  pendingDischarge: number;
  newExternalResults: number;
}

/** Live dashboard priority-row counts, scoped to the active department. */
export function useDashboardCounts(): DashboardCounts {
  const { patients, labRequests, documentations, pendingDischargeFileNos, department } = useAppStore();
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

  return { resultsToReview, dosesToApprove, incompleteDrafts, pendingDischarge, newExternalResults };
}

/** Patients in the active department (today's queue), ordered by token. */
export function useDepartmentQueue(): Patient[] {
  const { patients, department } = useAppStore();
  return patients
    .filter((p) => p.department === department)
    .sort((a, b) => (a.tokenNumber ?? 99) - (b.tokenNumber ?? 99));
}

export function useUnreadCount(): number {
  return useAppStore((s) => s.notifications.filter((n) => !n.isRead).length);
}
