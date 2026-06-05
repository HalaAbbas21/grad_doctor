import type { Laboratory } from "./types";

export const TEST_TYPES: { value: string; label: string }[] = [
  { value: "cbc", label: "تعداد دم كامل (CBC)" },
  { value: "lft", label: "وظائف الكبد (LFT)" },
  { value: "rft", label: "وظائف الكلى (RFT)" },
  { value: "electrolytes", label: "الشوارد" },
  { value: "crp", label: "البروتين الارتكاسي (CRP)" },
  { value: "bone-marrow", label: "بزل نقي العظم" },
  { value: "blood-culture", label: "زرع دم" },
  { value: "ct-scan", label: "طبقي محوري (CT)" },
  { value: "mri", label: "رنين مغناطيسي (MRI)" },
  { value: "lp", label: "بزل قطني (LP)" },
];

export const laboratories: Laboratory[] = [
  {
    id: "lab-basma-internal",
    name: "مخبر بسمة الداخلي",
    kind: "internal",
    supportedTests: ["cbc", "lft", "rft", "electrolytes", "crp", "blood-culture"],
  },
  {
    id: "lab-basma-pathology",
    name: "مخبر التشريح المرضي - بسمة",
    kind: "internal",
    supportedTests: ["bone-marrow", "lp"],
  },
  {
    id: "lab-biruni-external",
    name: "مخبر البيروني (خارجي)",
    kind: "external",
    supportedTests: ["cbc", "lft", "rft", "bone-marrow", "blood-culture", "lp"],
  },
  {
    id: "lab-radiology-external",
    name: "مركز الأشعة التخصصي (خارجي)",
    kind: "external",
    supportedTests: ["ct-scan", "mri"],
  },
];

export function testLabel(value: string): string {
  return TEST_TYPES.find((t) => t.value === value)?.label ?? value;
}
