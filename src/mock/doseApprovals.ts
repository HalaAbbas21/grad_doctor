import { DOCTOR_ID } from "./seed";
import type { DoseApproval, MarItem } from "./types";

// NOTE: never read by any screen — DoseApprovalScreen now calls the real
// POST /dose-approvals + PATCH /dose-approvals/{id}/approve API instead.
// One already-approved dose (with its resulting MAR item) so the "ready for
// nurse" state is demonstrable without needing a live approve action first.
export const doseApprovals: DoseApproval[] = [
  {
    id: "dose-1",
    patientFileNo: "B-3012",
    doctorId: DOCTOR_ID,
    stageRef: null,
    treatmentStageId: null,
    labTestRequestId: "lab-3",
    cycle: "1",
    lastDoseDate: null,
    recommendedDose: null,
    approvedDose: "1 g/m²",
    adjusted: false,
    adjustmentReason: null,
    notes: null,
    status: "approved",
    approvedAt: "2026-06-02T07:10:00",
    marItemId: "mar-1",
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
