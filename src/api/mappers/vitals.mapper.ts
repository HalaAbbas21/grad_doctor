import type { RawVitals } from "@/api/types/raw";
import type { Vitals } from "@/mock/types";

/** Measurements arrive as either a numeric string or a number — never trust either representation as-is. `""`/null/unparseable → null. */
function toNum(v: string | number | null): number | null {
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export function mapVitals(raw: RawVitals): Vitals {
  return {
    id: String(raw.id),
    patientFileNo: raw.patient_file_no,
    nurseId: String(raw.nurse_id),
    weight: toNum(raw.weight),
    height: toNum(raw.height),
    temperature: toNum(raw.temperature),
    pulse: toNum(raw.pulse),
    bloodPressureSystolic: toNum(raw.blood_pressure_systolic),
    bloodPressureDiastolic: toNum(raw.blood_pressure_diastolic),
    respiratoryRate: toNum(raw.respiratory_rate),
    oxygenSaturation: toNum(raw.oxygen_saturation),
    painScore: toNum(raw.pain_score),
    recordedAt: raw.recorded_at,
  };
}
