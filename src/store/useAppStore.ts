import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isDepartment } from "@/constants/departments";
import {
  appointments as seedAppointments,
  clinicalNotes as seedNotes,
  consultRequests as seedConsultRequests,
  dischargeReports as seedDischarge,
  doseApprovals as seedDoseApprovals,
  documentations as seedDocs,
  doctor as seedDoctor,
  labRequests as seedLabs,
  marItems as seedMarItems,
  notifications as seedNotifications,
  patients as seedPatients,
  pendingDischargeFileNos,
  treatmentPlans as seedPlans,
  vitals as seedVitals,
} from "@/mock";
import type {
  Appointment,
  AppNotification,
  ClinicalNote,
  ConsultRequest,
  Department,
  DischargeReport,
  DiseaseDocumentation,
  Doctor,
  DoseApproval,
  MarItem,
  MockLabRequest,
  Patient,
  TreatmentPlan,
  Vitals,
} from "@/mock/types";

interface AppState {
  // Session
  doctor: Doctor;
  department: Department;
  /**
   * True once a department has been explicitly chosen (this run or a prior
   * one, restored from localStorage — see the `persist` config below). This
   * is what tells routing whether a genuinely fresh login must see
   * /select-department, or whether a returning session may skip it.
   */
  departmentChosen: boolean;

  // Data (mutable copies of mock seed)
  patients: Patient[];
  vitals: Vitals[];
  labRequests: MockLabRequest[];
  documentations: DiseaseDocumentation[];
  treatmentPlans: TreatmentPlan[];
  dischargeReports: DischargeReport[];
  appointments: Appointment[];
  notes: ClinicalNote[];
  notifications: AppNotification[];
  pendingDischargeFileNos: string[];
  consultRequests: ConsultRequest[];
  doseApprovals: DoseApproval[];
  marItems: MarItem[];

  // Dev toggles to demonstrate error states
  simulateDownloadError: boolean;
  simulateApprovalError: boolean;

  // Actions — session
  setDepartment: (d: Department) => void;
  /**
   * Forces /select-department to appear again despite a persisted department —
   * called on every fresh login. A shift-selection screen: a doctor may work
   * Clinic in the morning and Inpatient in the afternoon, so a login must
   * never silently reuse yesterday's (or this morning's) department. Does not
   * touch `department` itself, only the "may I skip the screen" flag — a
   * bootstrap-restored session (page reload) never calls this and keeps
   * working in whatever department was already active.
   */
  requireDepartmentSelection: () => void;
  setSimulateDownloadError: (v: boolean) => void;
  setSimulateApprovalError: (v: boolean) => void;

  // Actions — clinical writes
  addLabRequest: (req: MockLabRequest) => void;
  markLabReviewed: (labId: string) => void;
  upsertDocumentation: (doc: DiseaseDocumentation) => void;
  upsertTreatmentPlan: (plan: TreatmentPlan) => void;
  addDischargeReport: (report: DischargeReport) => void;
  /** POST /dose-approvals — creates a "prepared" record; a dose approval cannot exist without a lab request. */
  createDoseApproval: (patientFileNo: string, labTestRequestId: string) => DoseApproval;
  /** PATCH /dose-approvals/{id}/approve — mints the MAR item; existence of a MAR item implies approved. */
  approveDoseApproval: (id: string, input: { approvedDose: string; route: string; medName: string }) => void;
  addNote: (note: ClinicalNote) => void;
  setPatientDestination: (fileNo: string, dept: Department) => void;
  coordinateConsultRequest: (id: string) => void;

  // Actions — notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      doctor: seedDoctor,
      department: seedDoctor.currentDepartment,
      departmentChosen: false,

      patients: seedPatients,
      vitals: seedVitals,
      labRequests: seedLabs,
      documentations: seedDocs,
      treatmentPlans: seedPlans,
      dischargeReports: seedDischarge,
      appointments: seedAppointments,
      notes: seedNotes,
      notifications: seedNotifications,
      pendingDischargeFileNos: pendingDischargeFileNos,
      consultRequests: seedConsultRequests,
      doseApprovals: seedDoseApprovals,
      marItems: seedMarItems,

      simulateDownloadError: false,
      simulateApprovalError: false,

      setDepartment: (d) =>
        set((s) => ({
          department: d,
          departmentChosen: true,
          doctor: { ...s.doctor, currentDepartment: d },
        })),
      requireDepartmentSelection: () => set({ departmentChosen: false }),
      setSimulateDownloadError: (v) => set({ simulateDownloadError: v }),
      setSimulateApprovalError: (v) => set({ simulateApprovalError: v }),

      addLabRequest: (req) => set((s) => ({ labRequests: [req, ...s.labRequests] })),

      markLabReviewed: (labId) =>
        set((s) => ({
          labRequests: s.labRequests.map((l) =>
            l.id === labId ? { ...l, reviewed: true, isExternalNew: false } : l
          ),
        })),

      upsertDocumentation: (doc) =>
        set((s) => {
          const exists = s.documentations.some((d) => d.id === doc.id);
          return {
            documentations: exists
              ? s.documentations.map((d) => (d.id === doc.id ? doc : d))
              : [doc, ...s.documentations],
          };
        }),

      upsertTreatmentPlan: (plan) =>
        set((s) => {
          const exists = s.treatmentPlans.some((p) => p.id === plan.id);
          return {
            treatmentPlans: exists
              ? s.treatmentPlans.map((p) => (p.id === plan.id ? plan : p))
              : [plan, ...s.treatmentPlans],
          };
        }),

      addDischargeReport: (report) =>
        set((s) => ({
          dischargeReports: [report, ...s.dischargeReports],
          pendingDischargeFileNos: s.pendingDischargeFileNos.filter((f) => f !== report.patientFileNo),
        })),

      createDoseApproval: (patientFileNo, labTestRequestId) => {
        const record: DoseApproval = {
          id: `dose-${Date.now()}`,
          patientFileNo,
          labTestRequestId,
          status: "prepared",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ doseApprovals: [record, ...s.doseApprovals] }));
        return record;
      },

      approveDoseApproval: (id, { approvedDose, route, medName }) =>
        set((s) => {
          const target = s.doseApprovals.find((d) => d.id === id);
          if (!target) return {};
          const marItemId = `mar-${Date.now()}`;
          const marItem: MarItem = {
            id: marItemId,
            patientFileNo: target.patientFileNo,
            doseApprovalId: id,
            medName,
            dose: approvedDose,
            route,
            scheduledTime: new Date().toISOString(),
            administrationStatus: "ready",
          };
          return {
            doseApprovals: s.doseApprovals.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: "approved",
                    approvedDose,
                    route,
                    marItemId,
                    approvedAt: new Date().toISOString(),
                    approvedBy: `د. ${s.doctor.firstName} ${s.doctor.lastName}`,
                  }
                : d
            ),
            marItems: [marItem, ...s.marItems],
            patients: s.patients.map((p) =>
              p.fileNoBasma === target.patientFileNo ? { ...p, queueStatus: "in-treatment" } : p
            ),
          };
        }),

      addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),

      setPatientDestination: (fileNo, dept) =>
        set((s) => ({
          patients: s.patients.map((p) => (p.fileNoBasma === fileNo ? { ...p, department: dept } : p)),
        })),

      coordinateConsultRequest: (id) =>
        set((s) => ({
          consultRequests: s.consultRequests.map((c) => (c.id === id ? { ...c, status: "coordinated" } : c)),
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) })),
    }),
    {
      name: "basma.doctor.department",
      // Only the department choice survives a reload — everything else here is mock seed state.
      partialize: (s) => ({ department: s.department }),
      merge: (persisted, current) => {
        const dept = (persisted as { department?: unknown } | undefined)?.department;
        return {
          ...current,
          department: isDepartment(dept) ? dept : current.department,
          departmentChosen: isDepartment(dept),
        };
      },
    }
  )
);
