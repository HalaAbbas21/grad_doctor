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
