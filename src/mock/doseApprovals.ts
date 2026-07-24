import type { DoseApproval, MarItem } from "./types";

// One already-approved dose (with its resulting MAR item) so the "ready for
// nurse" state is demonstrable without needing a live approve action first.
export const doseApprovals: DoseApproval[] = [
  {
    id: "dose-1",
    patientFileNo: "B-3012",
    labTestRequestId: "lab-3",
    status: "approved",
    approvedDose: "1 g/m²",
    route: "IV",
    marItemId: "mar-1",
    createdAt: "2026-06-02T07:00:00",
    approvedAt: "2026-06-02T07:10:00",
    approvedBy: "د. ليلى حدّاد",
  },
];

export const marItems: MarItem[] = [
  {
    id: "mar-1",
    patientFileNo: "B-3012",
    doseApprovalId: "dose-1",
    medName: "Cytarabine",
    dose: "1 g/m²",
    route: "IV",
    scheduledTime: "2026-06-02T07:10:00",
    administrationStatus: "ready",
  },
];
