import { create } from "zustand";
import {
  appointments as seedAppointments,
  clinicalNotes as seedNotes,
  dischargeReports as seedDischarge,
  documentations as seedDocs,
  doctor as seedDoctor,
  labRequests as seedLabs,
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
  Department,
  DischargeReport,
  DiseaseDocumentation,
  Doctor,
  LabTestRequest,
  Patient,
  TreatmentPlan,
  Vitals,
} from "@/mock/types";

interface AppState {
  // Session
  authenticated: boolean;
  doctor: Doctor;
  department: Department;

  // Data (mutable copies of mock seed)
  patients: Patient[];
  vitals: Vitals[];
  labRequests: LabTestRequest[];
  documentations: DiseaseDocumentation[];
  treatmentPlans: TreatmentPlan[];
  dischargeReports: DischargeReport[];
  appointments: Appointment[];
  notes: ClinicalNote[];
  notifications: AppNotification[];
  pendingDischargeFileNos: string[];

  // Dev toggle to demonstrate error states
  simulateDownloadError: boolean;

  // Actions — session
  login: () => void;
  logout: () => void;
  setDepartment: (d: Department) => void;
  setSimulateDownloadError: (v: boolean) => void;

  // Actions — clinical writes
  addLabRequest: (req: LabTestRequest) => void;
  markLabReviewed: (labId: string) => void;
  upsertDocumentation: (doc: DiseaseDocumentation) => void;
  upsertTreatmentPlan: (plan: TreatmentPlan) => void;
  addDischargeReport: (report: DischargeReport) => void;
  approveDose: (fileNo: string) => void;
  addNote: (note: ClinicalNote) => void;
  setPatientDestination: (fileNo: string, dept: Department) => void;

  // Actions — notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  authenticated: false,
  doctor: seedDoctor,
  department: seedDoctor.currentDepartment,

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

  simulateDownloadError: false,

  login: () => set({ authenticated: true }),
  logout: () => set({ authenticated: false }),
  setDepartment: (d) =>
    set((s) => ({ department: d, doctor: { ...s.doctor, currentDepartment: d } })),
  setSimulateDownloadError: (v) => set({ simulateDownloadError: v }),

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

  approveDose: (fileNo) =>
    set((s) => ({
      patients: s.patients.map((p) =>
        p.fileNoBasma === fileNo ? { ...p, queueStatus: "in-treatment" } : p
      ),
    })),

  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),

  setPatientDestination: (fileNo, dept) =>
    set((s) => ({
      patients: s.patients.map((p) => (p.fileNoBasma === fileNo ? { ...p, department: dept } : p)),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) })),
}));
