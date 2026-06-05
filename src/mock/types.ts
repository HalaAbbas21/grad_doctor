/**
 * Data model for the Basma Doctor app (§7 of the spec).
 * Every entity is fully typed — no `any`. Mock data conforms to these types.
 */

// ─── Shared enums / unions ──────────────────────────────────────────────────

export type Department = "clinic" | "daycare" | "inpatient";

export type LifeStatus =
  | "alive" // حياة
  | "deceased" // وفاة
  | "discontinued" // انقطاع عن العلاج
  | "lost" // فقد متابعة
  | "unknown"; // غير معروفة

export type Gender = "male" | "female";

export type Nationality = "syrian" | "syrian_palestinian" | "other";

export type Caregiver =
  | "both_parents" // الأب والأم
  | "father_only" // الأب فقط
  | "mother_only" // الأم فقط
  | "grandparent" // الجد أو الجدة
  | "relative" // العم/الخال/العمة/الخالة
  | "other"; // جهة أخرى

export type CaregiverEducation = "illiterate" | "primary" | "preparatory" | "secondary" | "university";

export type ProfessionalStatus = "specialist" | "resident"; // أخصائي / مقيم

export type LabKind = "internal" | "external"; // داخلي / خارجي

export type LabPriority = "routine" | "urgent" | "emergency"; // روتيني / عاجل / طارئ

export type LabRequestStatus = "pending" | "accepted" | "rejected" | "results-available";

export type DocStatus = "draft" | "submitted";

export type StageStatus = "in-progress" | "completed" | "pending"; // قيد التقدم / مكتملة / معلقة

export type AppointmentType = "follow-up" | "initial"; // متابعة / فحص أولي

export type AppointmentStatus = "scheduled" | "checked-in" | "done" | "missed";

export type NotificationType = "alert" | "info" | "reminder"; // تنبيه / معلومة / تذكير

/** Patient-status badge shown in queues/lists (§6.3). */
export type PatientQueueStatus =
  | "awaiting-lab" // بانتظار التحليل
  | "result-ready" // النتيجة جاهزة
  | "awaiting-dose-approval" // بانتظار إقرار الجرعة
  | "in-treatment" // قيد العلاج
  | "completed" // مكتمل
  | "critical"; // حالة حرجة

// ─── Core entities ──────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  professionalStatus: ProfessionalStatus;
  professionalId: string;
  contactEmail: string;
  contactPhone: string;
  currentDepartment: Department;
}

export interface PlaceRef {
  country: string;
  governorate: string;
  city: string;
}

export interface Referral {
  date: string;
  country: string;
  center: string;
  referringDoctorSpecialty: string;
  pattern: string;
}

export interface GeneralTreatment {
  receivedInitialAtBasma: boolean;
  initialStartDate?: string;
  initialType?: string;
  noCurativeReason?: string;
  palliativeType?: string;
  lastVitalStatus: LifeStatus;
}

export interface FollowUp {
  lastVitalStatusDate?: string;
  vitalStatusSource?: string;
  deathDate?: string;
  deathCause?: string;
  deathPlace?: string;
  deathCity?: string;
  deathGovernorate?: string;
  deathCountry?: string;
}

export interface Patient {
  fileNoBasma: string; // PRIMARY identity
  fileNoBiruni: string; // xxxx/yyyy
  electronicFileDate: string;
  basmaFileOpenDate: string;
  biruniFileOpenDate: string;
  nationalIdPatient: string;
  nationalIdFather: string;
  firstName: string;
  familyName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: Gender;
  nationality: Nationality;
  familyRegistry: PlaceRef;
  residence: PlaceRef;
  caregiver: Caregiver;
  caregiverEducation: CaregiverEducation;
  phones: { father?: string; mother?: string; caregiver?: string; extra?: string };
  referral: Referral;
  generalTreatment: GeneralTreatment;
  followUp: FollowUp;
  lifeStatus: LifeStatus;
  diagnosis: string;
  currentPhase: string;
  criticalFlags: string[];
  department: Department;
  registrationDate: string;

  // Queue/dashboard helpers (mock-only derived state)
  queueStatus: PatientQueueStatus;
  tokenNumber?: number;
  waitingSince?: string; // ISO; used to compute waiting time
}

export interface Vitals {
  id: string;
  patientFileNo: string;
  weight: number; // kg
  height: number; // cm
  temperature: number; // °C
  pulse: number; // bpm
  bloodPressure: string; // e.g. "110/70"
  respiratoryRate: number; // /min
  recordedAt: string;
}

// ─── Dynamic medical templates ───────────────────────────────────────────────

export type QuestionInputType = "select" | "multi-select" | "number" | "date" | "boolean" | "text";

export interface TemplateQuestion {
  id: string;
  label: string;
  inputType: QuestionInputType;
  required?: boolean;
  options?: { value: string; label: string }[]; // for select / multi-select
  unit?: string; // for number
  placeholder?: string;
  helpText?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  questions: TemplateQuestion[];
}

export interface MedicalTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  cancerType: string;
  isActive: boolean;
  structure: { sections: TemplateSection[] };
}

/** A free-form answer value keyed by question id. */
export type TemplateAnswer = string | number | boolean | string[] | null;

export interface DiseaseDocumentation {
  id: string;
  patientFileNo: string;
  doctorId: string;
  templateId: string;
  templateName: string;
  version: string;
  data: Record<string, TemplateAnswer>;
  status: DocStatus;
  createdAt: string;
  lastModifiedAt: string;
}

// ─── Labs ────────────────────────────────────────────────────────────────────

export interface Laboratory {
  id: string;
  name: string;
  kind: LabKind;
  supportedTests: string[]; // test types this lab can run
}

export interface LabTestRequest {
  id: string;
  patientFileNo: string;
  doctorId: string;
  laboratoryId: string;
  labKind: LabKind;
  testTypes: string[];
  clinicalIndication?: string;
  priority: LabPriority;
  dateRequired?: string;
  requestDate: string;
  status: LabRequestStatus;
  rejectionReason?: string;
  resultFilePath?: string;
  resultUploadDate?: string;
  /** True when the result has been reviewed by the doctor (gates dosing). */
  reviewed?: boolean;
  /** Links this lab to a pending dose approval. */
  tiedToDose?: boolean;
  isExternalNew?: boolean; // newly arrived external result (dashboard count)
}

// ─── Treatment plan ────────────────────────────────────────────────────────────

export interface Medication {
  name: string;
  dose: string;
  schedule: string;
}

export interface TreatmentStage {
  id: string;
  planId: string;
  stageName: string;
  startDate: string;
  endDate: string;
  description?: string;
  medications: Medication[];
  procedures: string;
  cycles: number;
  visits: number;
  milestones: string;
  status: StageStatus;
}

export interface TreatmentPlan {
  id: string;
  patientFileNo: string;
  doctorId: string;
  planName: string;
  startDate: string;
  estimatedEndDate: string;
  overallDescription?: string;
  phases: TreatmentStage[];
}

// ─── Dose ────────────────────────────────────────────────────────────────────

export interface DoseApproval {
  id: string;
  patientFileNo: string;
  doctorId: string;
  stageRef: string;
  cycle: string;
  lastDoseDate?: string;
  recommendedDose: string;
  approvedDose: string;
  adjusted: boolean;
  adjustmentReason?: string;
  notes?: string;
  preDoseLabId: string;
  approvedAt: string;
}

// ─── Discharge ──────────────────────────────────────────────────────────────

export interface PrescriptionItem {
  med: string;
  dose: string;
  instructions: string;
}

export interface DischargeReport {
  id: string;
  patientFileNo: string;
  doctorId: string;
  stageRef: string;
  lastDoseDate?: string;
  prescription: PrescriptionItem[];
  doctorInstructions: string;
  nextDoseDate?: string;
  nextVisitDepartment: Department;
  generatedBy: string;
  generatedAt: string;
  exportable: boolean;
}

// ─── Appointments & notes ──────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientFileNo: string;
  doctorId: string;
  dateTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  assignedStaff: string;
  notes?: string;
}

export interface ClinicalNote {
  id: string;
  patientFileNo: string;
  doctorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedPatientFileNo?: string;
  timestamp: string;
  isRead: boolean;
  /** Optional deep-link target route. */
  link?: string;
}
