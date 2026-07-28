import { isDepartment } from "@/constants/departments";
import { computeAgeFromDob } from "./age";
import type { RawPatientDetail, RawPatientListItem } from "@/api/types/raw";
import type { ConsultationType, LifeStatus, Patient, PatientListItem } from "@/mock/types";

function mapGender(raw: string | null): "male" | "female" | null {
  return raw === "male" || raw === "female" ? raw : null;
}

// TODO(api-contract): only "complete" and "partial" have been observed for
// registration_status. Anything else falls back to "partial" — the safer
// default, since it surfaces the incomplete-record badge rather than
// silently presenting an unrecognized status as a fully registered patient.
function mapRegistrationStatus(raw: string): "complete" | "partial" {
  return raw === "complete" ? "complete" : "partial";
}

const KNOWN_LIFE_STATUSES: LifeStatus[] = ["alive", "deceased", "discontinued", "lost", "unknown"];

/** Falls back to "unknown" (an existing, real LifeStatus value) rather than crash on an unconfirmed one. */
function mapLifeStatus(raw: string): LifeStatus {
  return (KNOWN_LIFE_STATUSES as string[]).includes(raw) ? (raw as LifeStatus) : "unknown";
}

const KNOWN_CONSULTATION_TYPES: ConsultationType[] = [
  "cardiac",
  "neurological",
  "ophthalmic",
  "ent",
  "surgery",
  "other",
];

/** The API sends `null` for some patients and `[]` for others — never assume an array. */
function mapConsultationNeeds(raw: string[] | null): ConsultationType[] {
  return (raw ?? []).filter((v): v is ConsultationType => (KNOWN_CONSULTATION_TYPES as string[]).includes(v));
}

/**
 * `phones`/`referral`/`general_treatment`/`follow_up`/`family_registry`/
 * `residence` all come back as `[]` when the patient has none recorded, but
 * are expected to be objects once populated. Only the empty-array shape has
 * been observed — TODO(api-contract): confirm the populated object shape of
 * each; this passes an observed object through as-is rather than mapping
 * named fields that haven't been verified yet.
 */
function emptyArrayToNull<T>(v: unknown[] | Record<string, unknown> | null | undefined): T | null {
  if (!v || Array.isArray(v)) return null;
  return v as T;
}

export function mapPatientListItem(raw: RawPatientListItem): PatientListItem {
  return {
    fileNoBasma: raw.file_no_basma,
    firstName: raw.first_name,
    familyName: raw.family_name,
    fullName: raw.full_name,
    dob: raw.dob,
    age: computeAgeFromDob(raw.dob),
    gender: mapGender(raw.gender),
    registrationStatus: mapRegistrationStatus(raw.registration_status),
    lifeStatus: raw.life_status,
    department: isDepartment(raw.department) ? raw.department : null,
    registrationDate: raw.registration_date,
  };
}

export function mapPatientDetail(raw: RawPatientDetail): Patient {
  return {
    fileNoBasma: raw.file_no_basma,
    fileNoBiruni: raw.file_no_biruni,
    electronicFileDate: raw.electronic_file_date,
    basmaFileOpenDate: raw.basma_file_open_date,
    biruniFileOpenDate: raw.biruni_file_open_date,
    nationalIdPatient: raw.national_id_patient,
    nationalIdFather: raw.national_id_father,
    firstName: raw.first_name,
    familyName: raw.family_name,
    fullName: raw.full_name,
    fatherName: raw.father_name,
    motherName: raw.mother_name,
    dob: raw.dob,
    age: computeAgeFromDob(raw.dob),
    gender: mapGender(raw.gender),
    // TODO(api-contract): only "syrian" (nationality), "father_only" (caregiver),
    // and "illiterate" (caregiver_education) have been observed — each matches
    // an existing union member today, but isn't validated against the full set.
    nationality: raw.nationality as Patient["nationality"],
    familyRegistry: emptyArrayToNull(raw.family_registry),
    residence: emptyArrayToNull(raw.residence),
    caregiver: raw.caregiver as Patient["caregiver"],
    caregiverEducation: raw.caregiver_education as Patient["caregiverEducation"],
    phones: emptyArrayToNull(raw.phones),
    referral: emptyArrayToNull(raw.referral),
    generalTreatment: emptyArrayToNull(raw.general_treatment),
    followUp: emptyArrayToNull(raw.follow_up),
    lifeStatus: mapLifeStatus(raw.life_status),
    diagnosis: raw.diagnosis,
    currentPhase: raw.current_phase,
    // The API sends `null` for some patients (e.g. A-0013) and `[]` for others — never assume an array.
    criticalFlags: raw.critical_flags ?? [],
    department: isDepartment(raw.department) ? raw.department : null,
    registrationDate: raw.registration_date,
    registrationStatus: mapRegistrationStatus(raw.registration_status),
    consultationNeeds: mapConsultationNeeds(raw.consultation_needs),
  };
}
