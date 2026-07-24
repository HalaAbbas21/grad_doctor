/**
 * Single source of truth for the department domain value — mirrors the backend
 * exactly (`clinic` · `daycare` · `inpatient`). Import `Department`/`DEPARTMENTS`
 * from here instead of writing the union or string literals inline.
 */
export const DEPARTMENTS = ["clinic", "daycare", "inpatient"] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS_AR: Record<Department, string> = {
  clinic: "العيادة",
  daycare: "القسم النهاري",
  inpatient: "القسم الداخلي",
};

export function isDepartment(v: unknown): v is Department {
  return typeof v === "string" && (DEPARTMENTS as readonly string[]).includes(v);
}
