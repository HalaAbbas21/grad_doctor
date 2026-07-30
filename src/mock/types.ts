/**
 * Data model for the Basma Doctor app (§7 of the spec).
 * Every entity is fully typed — no `any`. Mock data conforms to these types.
 *
 * This file is a shared contract copied across all six Basma apps (Doctor,
 * Nurse, Reception, Admin, Lab, Guardian). Two changes made here on
 * 2026-07-24 affect other apps and require follow-up there:
 *   - `Department`: the value was already `"daycare"` (lowercase) in this
 *     app; it now also has a single canonical source (src/constants/departments.ts).
 *   - `MedicationOrder` did not exist in this app to rename — `MarItem` is
 *     introduced fresh here, with `doseApprovalId` provenance and no
 *     `approvalStatus` field. The Nurse app, which reads a medication-order
 *     shape directly, needs to confirm/adopt this same shape.
 */

// ─── Shared enums / unions ──────────────────────────────────────────────────

// Department is defined in src/constants/departments.ts (the single source of
// truth for this value — it must match the backend exactly) and re-exported
// here so existing `@/mock/types` imports keep working.
import type { Department } from "@/constants/departments";
export type { Department } from "@/constants/departments";

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

export type NotificationType = "alert" | "info" | "reminder"; // تنبيه / معلومة / تذكير

export type ConsultationType = "cardiac" | "neurological" | "ophthalmic" | "ent" | "surgery" | "other";

export type ConsultRequestStatus = "pending" | "coordinated";

/** Patient-status badge shown in queues/lists (§6.3). */
export type PatientQueueStatus =
  | "awaiting-lab" // بانتظار التحليل
  | "result-ready" // النتيجة جاهزة
  | "awaiting-dose-approval" // بانتظار إقرار الجرعة
  | "in-treatment" // قيد العلاج
  | "completed" // مكتمل
  | "critical"; // حالة حرجة

// ─── Auth (real backend — src/api/, not mock) ──────────────────────────────
// The authenticated account from Sanctum login. Separate from `Doctor` below,
// which is mock profile data every feature screen still renders (§ scope of
// the auth-only migration).

export interface AuthUser {
  id: string; // backend sends a number — stringified in the mapper
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string; // 'doctor' | 'admin' | … — kept open, see can() in auth.store.ts
  status: string; // 'active' | 'inactive' | …
  permissions: string[]; // deliberately not a closed union — server has undocumented keys
  lastActivity?: string; // ISO timestamp, verified on /auth/me
}

/**
 * GET /doctor/profile — a separate, richer profile source than AuthUser
 * (/auth/me). Not a replacement for AuthUser; ProfileScreen reads both.
 */
export interface DoctorProfile {
  id: string; // already a string on the wire — never re-stringified
  firstName: string;
  lastName: string;
  specialization: string | null;
  // TODO(api-contract): only "specialist" observed; "resident"/"attending"
  // are plausible but unconfirmed. Kept open.
  professionalStatus: string;
  professionalId: string | null;
  contactEmail: string;
  contactPhone: string | null;
  currentDepartment: Department | null;
}

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

/**
 * Shared by every still-mock screen AND the real GET /patients/{id} mapper
 * (see mapPatientDetail in src/api/mappers/patient.mapper.ts) — a superset of
 * PatientListItem. Real records are often sparse (a patient can be
 * registered but not yet clinically documented), so every field the API can
 * actually send back as null/absent is typed that way here, even though
 * every mock patient in src/mock/patients.ts always supplies a real value.
 * `age`, `fullName`, and `registrationStatus` don't exist on the old mock
 * factory output — makePatient() below derives them automatically so none of
 * the ~14 mock patient literals needed editing.
 */
export interface Patient {
  fileNoBasma: string; // PRIMARY identity
  fileNoBiruni?: string | null; // xxxx/yyyy
  electronicFileDate: string;
  basmaFileOpenDate: string;
  biruniFileOpenDate?: string | null;
  nationalIdPatient?: string | null;
  nationalIdFather?: string | null;
  firstName: string;
  familyName: string;
  fullName: string;
  fatherName?: string | null;
  motherName?: string | null;
  dob: string | null;
  age: number | null; // computed from dob — see computeAgeFromDob
  gender: Gender | null;
  nationality: Nationality;
  familyRegistry?: PlaceRef | null;
  residence?: PlaceRef | null;
  caregiver: Caregiver;
  caregiverEducation: CaregiverEducation;
  phones?: { father?: string; mother?: string; caregiver?: string; extra?: string } | null;
  referral?: Referral | null;
  generalTreatment?: GeneralTreatment | null;
  followUp?: FollowUp | null;
  lifeStatus: LifeStatus;
  diagnosis: string | null;
  currentPhase: string | null;
  criticalFlags: string[];
  department: Department | null;
  registrationDate: string;
  registrationStatus: "complete" | "partial"; // TODO(api-contract): confirm the full value set (matches PatientListItem)
  /** Consultation specialties this patient's case has been flagged for. */
  consultationNeeds?: ConsultationType[];

  // Queue/dashboard helpers (mock-only derived state — no real endpoint yet)
  queueStatus?: PatientQueueStatus;
  tokenNumber?: number;
  waitingSince?: string; // ISO; used to compute waiting time
}

// ─── Real backend — patient list slice (src/api/, not mock) ───────────────
// GET /patients?perPage=15's item shape. Deliberately narrower than `Patient`
// above (mock, still used by every other still-mock screen) — the list
// endpoint returns fewer fields than the detail endpoint will.

export interface PatientListItem {
  fileNoBasma: string;
  firstName: string;
  familyName: string;
  fullName: string;
  dob: string | null;
  age: number | null; // computed from dob; null when dob is null
  gender: "male" | "female" | null;
  registrationStatus: "complete" | "partial"; // TODO(api-contract): confirm the full value set
  lifeStatus: string; // keep open — 'alive' seen; others unconfirmed
  department: Department | null;
  registrationDate: string;
}

export interface Vitals {
  id: string;
  patientFileNo: string;
  nurseId: string;
  weight: number | null; // kg
  height: number | null; // cm
  temperature: number | null; // °C
  pulse: number | null; // bpm
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  respiratoryRate: number | null; // /min
  oxygenSaturation: number | null; // %
  painScore: number | null; // 0–10
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
  kind: string;
  supportedTests: string[]; // test types this lab can run
  // TODO(api-contract): only "pending_lab_completion"/"completed" observed.
  // Kept open so an unseen value never crashes.
  profileStatus: string;
}

/**
 * The mock/authoring-flow shape — one row conflating a request and its
 * result, used only by the still-mock LabsScreen/LabRequestScreen/
 * ResultsScreen/DoseApprovalScreen. The real API splits this into two
 * separate resources (GET /lab-test-requests, GET /lab-results) — see
 * `LabTestRequest`/`LabResult` below, used by the patient record's real
 * labs tab. Kept as a distinct type rather than force-fit into the real
 * shape, since merging them would require also rewriting those four
 * still-mock screens, out of scope here.
 */
export interface MockLabRequest {
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

// ─── Labs (real API — GET /lab-test-requests, GET /lab-results) ──────────────

export interface SampleDraw {
  id: string;
  status: string;
  drawnAt: string | null;
  sampleNotes: string | null;
}

export interface LabTestRequest {
  id: string;
  patientFileNo: string;
  requestedBy: string;
  requestedByName: string | null;
  laboratoryId: string;
  laboratoryName: string | null;
  labKind: string;
  testTypes: string[];
  priority: string;
  clinicalIndication: string | null;
  treatmentStage: string | null;
  requestDate: string;
  // TODO(api-contract): "results_available" observed; "pending"/"accepted"/
  // "rejected" exist per the README but are unconfirmed live. Kept open.
  status: string;
  rejectionReason: string | null;
  preDose: boolean;
  reviewed: boolean;
  reviewedAt: string | null;
  reviewedByDoctorId: string | null;
  sampleDraw: SampleDraw | null;
  latestResultVersion: number | null;
}

export interface LabResult {
  id: string;
  requestId: string;
  patientFileNo: string;
  laboratoryId: string;
  testType: string;
  // TODO(api-contract): wire PDF download via /lab-results/{id}/download — a later slice.
  resultFilePath: string;
  resultDate: string;
  version: number;
  isRead: boolean;
  summary: string | null;
  uploadedByName: string | null;
}

// ─── Consult requests ───────────────────────────────────────────────────────
// Reception creates these (POST); the doctor only reads and coordinates them
// (GET /consult-requests, PATCH /consult-requests/{id}/coordinate) — no
// create/delete affordance belongs in this app.

export interface ConsultRequest {
  id: string;
  patientFileNo: string;
  consultationType: ConsultationType;
  notes: string | null;
  // TODO(api-contract): only "pending"/"coordinated" observed. Kept open
  // (not the closed ConsultRequestStatus union) so an unseen value never
  // crashes — the UI (see ConsultStatusBadge) falls back to a neutral badge
  // showing the raw value.
  status: string;
  requestedBy: string;
  createdAt: string;
}

// ─── Treatment plan ────────────────────────────────────────────────────────────

export interface PhaseMedication {
  id?: string;
  name: string;
  dose: string;
  schedule: string | null;
}

export interface TreatmentPhase {
  id: string;
  stageName: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  procedures: string | null;
  cycles: number | null;
  visits: number | null;
  milestones: string | null;
  // TODO(api-contract): only "in_progress" has been observed; "completed"/
  // "pending" are expected but unconfirmed. Kept open so an unseen value
  // never crashes.
  status: string;
  medications: PhaseMedication[];
}

export interface TreatmentPlan {
  id: string;
  patientFileNo: string;
  doctorId: string;
  planName: string;
  startDate: string | null;
  estimatedEndDate: string | null;
  overallDescription: string | null;
  phases: TreatmentPhase[];
}

/**
 * POST /treatment-plans write payload — deliberately separate from the read
 * types above, not a reuse of TreatmentPhase/PhaseMedication. Narrower shape
 * (no id/plan_id/endDate/description/procedures/visits/milestones — the
 * backend assigns/defaults those on create) and a real, confirmed naming
 * asymmetry: the request calls the phase array `stages`, while the response
 * (and TreatmentPlan.phases above) calls the same thing `phases`. Both spellings are intentional, not a typo.
 */
export interface CreatePhaseMedicationPayload {
  name: string;
  dose: string;
  schedule?: string;
}

export interface CreateTreatmentStagePayload {
  stageName: string;
  startDate: string; // plain date ("YYYY-MM-DD"), not a full ISO datetime
  status: string;
  medications: CreatePhaseMedicationPayload[];
}

export interface CreateTreatmentPlanPayload {
  patientFileNo: string;
  planName: string;
  startDate: string; // plain date ("YYYY-MM-DD"), not a full ISO datetime
  stages: CreateTreatmentStagePayload[];
}

// ─── Dose ────────────────────────────────────────────────────────────────────
// Two-step model matching the backend (POST /dose-approvals, then PATCH
// .../{id}/approve): a dose approval cannot exist without the lab request
// that justifies it, and a MAR item only exists as the product of an
// approved one — so for the nurse, existence means approved.

export interface DoseApproval {
  id: string;
  patientFileNo: string;
  labTestRequestId: string; // REQUIRED — the lab-before-dose gate, enforced server-side
  status: "prepared" | "approved"; // TODO(api-contract): confirm exact values
  approvedDose?: string; // set at the approve step
  route?: string; // set at the approve step
  marItemId?: string; // returned by the approve call
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

/** The nurse's administration item — produced only by an approved DoseApproval. */
export interface MarItem {
  id: string;
  patientFileNo: string;
  doseApprovalId?: string; // provenance link back to the approval that created it
  medName: string;
  dose: string;
  route: string;
  scheduledTime: string;
  administrationStatus: "scheduled" | "ready" | "administered" | "missed";
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
  stageRef: string | null;
  lastDoseDate: string | null;
  prescription: PrescriptionItem[];
  doctorInstructions: string | null;
  nextDoseDate: string | null;
  nextVisitDepartment: Department | null;
  generatedAt: string;
  exportable: boolean;
}

// ─── Appointments & notes ──────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientFileNo: string;
  patientName: string;
  department: Department | null;
  doctorId: string;
  doctorName: string;
  /** Full ISO datetime — split into date/time only at render time, not here. */
  scheduledAt: string;
  // TODO(api-contract): only "initial_exam" and "follow_up" have been observed.
  // Kept as an open string (not a union) so an unseen value never crashes —
  // render sites fall back to showing the raw value for anything unrecognized.
  type: string;
  // TODO(api-contract): observed so far: "scheduled", "cancelled", "completed".
  // "confirmed" and others (e.g. "no-show") are plausible but unconfirmed. Kept
  // open for the same reason as `type`.
  status: string;
  notes: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Queues ─────────────────────────────────────────────────────────────────

export interface QueueItem {
  id: string;
  /** Token like "D-12" — a string, not a number; never parse it. */
  number: string;
  patientFileNo: string;
  patientName: string;
  department: Department | null;
  queueDate: string;
  /** Full ISO datetime. */
  issueTime: string;
  // TODO(api-contract): only "served" has been observed; "waiting"/"called"
  // are expected but unconfirmed. Kept open so an unseen value never crashes.
  status: string;
  isEmergency: boolean;
  visibleToGuardian: boolean;
  pendingData: boolean;
}

export interface ClinicalNote {
  id: string;
  patientFileNo: string;
  authorId: string;
  authorName: string;
  body: string;
  // TODO(api-contract): only "clinical" has been observed; others (e.g.
  // "administrative") are plausible but unconfirmed. Kept open.
  kind: string;
  createdAt: string;
  // TODO(api-contract): not present in the verified create response — don't
  // assume edit (PATCH) is supported until confirmed.
  lastEditedAt?: string | null;
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
