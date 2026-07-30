/**
 * Raw snake_case DTOs as the backend actually sends them. Nothing outside
 * `src/api/` should ever see these shapes — see mappers/ for the boundary.
 */
export interface RawUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  permissions: string[];
  last_activity?: string;
}

export interface RawLoginResponse {
  user: RawUser;
  token: string;
}

/**
 * GET /patients?perPage=15 — verified shape. The list endpoint returns fewer
 * fields than the (not yet verified) detail endpoint will.
 */
export interface RawPatientListItem {
  file_no_basma: string;
  first_name: string;
  family_name: string;
  full_name: string;
  dob: string | null;
  gender: string | null;
  registration_status: string;
  life_status: string;
  department: string | null;
  registration_date: string;
}

/**
 * GET /patients/{file_no_basma} — verified shape. Extends the list item
 * (every list field is present here too, same names/values) with the fuller
 * detail-only fields. `phones`/`referral`/`general_treatment`/`follow_up`
 * come back as `[]` when empty — only that empty-array shape is verified;
 * TODO(api-contract): confirm the populated object shape of each.
 */
/**
 * GET /appointments?perPage=15 — verified shape. `id`/`doctor_id`/
 * `created_by_reception_id` are numbers. `scheduled_at` is a full ISO
 * datetime (date + time together, split apart only at render time).
 * `type` observed: "initial_exam" | "follow_up". `status` observed:
 * "scheduled" | "cancelled" — others (e.g. "completed", "no-show") are
 * plausible but unconfirmed. `department` is lowercase clinic/daycare/inpatient.
 */
export interface RawAppointment {
  id: number;
  patient_file_no: string;
  patient_name: string;
  department: string;
  doctor_id: number;
  doctor_name: string;
  scheduled_at: string;
  type: string;
  status: string;
  notes: string | null;
  created_by_reception_id: number;
  cancelled_by: number | null;
  cancelled_at: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /queues?department=&perPage= — verified shape. `id`/`check_in_id` are
 * numbers; `number` is a string token (e.g. "D-12"), never parse it as a
 * number. `status` observed: "served" only — "waiting"/"called" are expected
 * but unconfirmed. `queue_date` is a plain date; `issue_time` is a full ISO
 * datetime.
 */
export interface RawQueueItem {
  id: number;
  number: string;
  patient_file_no: string;
  patient_name: string;
  department: string;
  queue_date: string;
  issue_time: string;
  status: string;
  is_emergency: boolean;
  visible_to_guardian: boolean;
  pending_data: boolean;
  check_in_id: number;
}

/**
 * GET /clinical-notes?patient_file_no= and POST /clinical-notes — verified
 * shape. `body`/`text` are duplicate fields carrying the same value (the
 * backend is mid-rename) — map from `body`, falling back to `text`. `id`/
 * `author_id` are numbers. `kind` observed: "clinical" only. No
 * `last_edited_at`/`updated_at` in the verified create response — kept
 * optional here since GET may return it once edit support exists.
 * TODO(api-contract): confirm note edit (PATCH) support and shape.
 */
export interface RawClinicalNote {
  id: number;
  patient_file_no: string;
  author_id: number;
  author_name: string;
  body?: string;
  text?: string;
  kind: string;
  created_at: string;
  last_edited_at?: string | null;
}

/**
 * GET /patients/{file_no}/treatment-plans — verified shape (also the shape
 * returned by POST /treatment-plans). Nested: plan → phases[] → medications[].
 * Many fields are null on a minimally-created plan. `id`/`plan_id`/
 * `doctor_id` are numbers.
 */
export interface RawPhaseMedication {
  id: number;
  name: string;
  dose: string;
  schedule: string | null;
}

/** `status` observed: "in_progress" only — "completed"/"pending" are expected but unconfirmed. */
export interface RawTreatmentPhase {
  id: number;
  plan_id: number;
  stage_name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  procedures: string | null;
  cycles: number | null;
  visits: number | null;
  milestones: string | null;
  status: string;
  medications: RawPhaseMedication[] | null;
}

export interface RawTreatmentPlan {
  id: number;
  patient_file_no: string;
  doctor_id: number;
  plan_name: string;
  start_date: string | null;
  estimated_end_date: string | null;
  overall_description: string | null;
  phases: RawTreatmentPhase[] | null;
}

/**
 * GET /patients/{file_no}/vitals — verified shape. Measurements come back as
 * either a numeric string ("20.50") or a number (98) depending on the field —
 * never trust either representation, always coerce defensively. `id`/
 * `nurse_id` are numbers. `blood_pressure` is a combined display string;
 * `blood_pressure_systolic`/`blood_pressure_diastolic` are the numeric
 * source of truth.
 */
export interface RawVitals {
  id: number;
  patient_file_no: string;
  nurse_id: number;
  weight: string | number | null;
  height: string | number | null;
  temperature: string | number | null;
  pulse: string | number | null;
  blood_pressure: string | null;
  blood_pressure_systolic: string | number | null;
  blood_pressure_diastolic: string | number | null;
  respiratory_rate: string | number | null;
  oxygen_saturation: string | number | null;
  pain_score: string | number | null;
  recorded_at: string;
}

/**
 * GET /consult-requests?perPage= — verified shape. `id`/`requested_by` are
 * numbers. `status` observed: "pending" | "coordinated". `consultation_type`
 * observed: "cardiac" | "neurological" — matches the existing
 * ConsultationType union, but isn't validated as exhaustive.
 */
export interface RawConsultRequest {
  id: number;
  patient_file_no: string;
  consultation_type: string;
  status: string;
  notes: string | null;
  requested_by: number;
  created_at: string;
}

/**
 * GET /lab-test-requests?patient_file_no= and GET /lab-results?patient_file_no=
 * — verified shapes. Two separate resources, matched client-side via
 * lab_result.request_id === lab_test_request.id. `test_types` may be
 * empty/null. `patient_ref`/`sample_draw` are nested and may be null.
 */
export interface RawPatientRef {
  file_no_basma: string;
  age: number | null;
  gender: string | null;
}

export interface RawSampleDraw {
  id: number;
  status: string;
  drawn_at: string | null;
  sample_notes: string | null;
}

/** `status` observed: "results_available" — "pending"/"accepted"/"rejected" exist per the README but unconfirmed live. */
export interface RawLabTestRequest {
  id: number;
  patient_file_no: string;
  patient_ref: RawPatientRef | null;
  requested_by: number;
  requested_by_name: string | null;
  laboratory_id: number;
  laboratory_name: string | null;
  lab_kind: string;
  test_types: string[] | null;
  priority: string;
  clinical_indication: string | null;
  treatment_stage: string | null;
  request_date: string;
  status: string;
  rejection_reason: string | null;
  pre_dose: boolean;
  reviewed: boolean;
  reviewed_at: string | null;
  reviewed_by_doctor_id: number | null;
  sample_draw: RawSampleDraw | null;
  latest_result_version: number | null;
}

export interface RawLabResult {
  id: number;
  request_id: number;
  patient_file_no: string;
  laboratory_id: number;
  test_type: string;
  result_file_path: string;
  result_date: string;
  version: number;
  is_read: boolean;
  summary: string | null;
  uploaded_by_name: string | null;
}

/**
 * GET /discharge-reports?patient_file_no= — verified shape. `id`/`doctor_id`
 * are numbers. `prescription` is an array of objects, not strings — guard
 * with `?? []`, don't assume it's always populated.
 */
export interface RawPrescriptionItem {
  med: string;
  dose: string;
  instructions: string;
}

export interface RawDischargeReport {
  id: number;
  patient_file_no: string;
  doctor_id: number;
  stage_ref: string | null;
  last_dose_date: string | null;
  prescription: RawPrescriptionItem[] | null;
  doctor_instructions: string | null;
  next_dose_date: string | null;
  next_visit_department: string | null;
  generated_at: string;
  exportable: boolean;
}

/**
 * GET /laboratories — verified shape. `id` is a number — this is the one
 * write-path id in the app that goes back out numeric (POST
 * /lab-test-requests' laboratory_id), not stringified.
 * `profile_status` observed: "pending_lab_completion" | "completed".
 */
export interface RawLaboratory {
  id: number;
  name: string;
  kind: string;
  supported_tests: string[] | null;
  profile_status: string;
}

/**
 * GET /doctor/profile — verified shape. Unlike every other endpoint in this
 * app, this response is already camelCase — no snake_case conversion here,
 * and no fields are invented on the wire just to match convention. `id` is
 * already a string (don't re-stringify it). `currentDepartment` still needs
 * validation via isDepartment(); everything else passes through as-is.
 */
export interface RawDoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string | null;
  professionalStatus: string;
  professionalId: string | null;
  contactEmail: string;
  contactPhone: string | null;
  currentDepartment: string | null;
}

export interface RawPatientDetail extends RawPatientListItem {
  file_no_biruni: string | null;
  electronic_file_date: string;
  basma_file_open_date: string;
  biruni_file_open_date: string | null;
  national_id_patient: string | null;
  national_id_father: string | null;
  father_name: string | null;
  mother_name: string | null;
  nationality: string;
  family_registry: unknown[] | Record<string, unknown> | null;
  residence: unknown[] | Record<string, unknown> | null;
  caregiver: string;
  caregiver_education: string;
  phones: unknown[] | Record<string, unknown>;
  referral: unknown[] | Record<string, unknown>;
  general_treatment: unknown[] | Record<string, unknown>;
  follow_up: unknown[] | Record<string, unknown>;
  diagnosis: string | null;
  current_phase: string | null;
  // Observed null on some patients (e.g. A-0013) and [] on others — never assume an array.
  critical_flags: string[] | null;
  consultation_needs: string[] | null;
  created_at: string;
  updated_at: string;
}
