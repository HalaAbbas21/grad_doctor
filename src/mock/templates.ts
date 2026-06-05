import type { MedicalTemplate } from "./types";

/**
 * Two working JSON medical templates (§5.5 / §8). The dynamic form renderer
 * builds itself entirely from this `structure`. Add a template = add an object here.
 */
export const templates: MedicalTemplate[] = [
  {
    id: "tpl-all-v2",
    name: "قالب تشخيص ابيضاض الدم الليمفاوي الحاد (ALL)",
    version: "2.1",
    description: "توثيق تشخيص وتصنيف ابيضاض الدم الليمفاوي الحاد لدى الأطفال.",
    cancerType: "ابيضاض الدم الليمفاوي الحاد (ALL)",
    isActive: true,
    structure: {
      sections: [
        {
          id: "sec-clinical",
          title: "العرض السريري",
          description: "الأعراض والعلامات عند التشخيص.",
          questions: [
            {
              id: "symptom-onset",
              label: "تاريخ بداية الأعراض",
              inputType: "date",
              required: true,
            },
            {
              id: "presenting-symptoms",
              label: "الأعراض الظاهرة",
              inputType: "multi-select",
              required: true,
              options: [
                { value: "fever", label: "حمى" },
                { value: "pallor", label: "شحوب" },
                { value: "bruising", label: "كدمات / نزف" },
                { value: "bone-pain", label: "ألم عظمي" },
                { value: "lymphadenopathy", label: "ضخامة عقد لمفية" },
                { value: "hepatosplenomegaly", label: "ضخامة كبد وطحال" },
              ],
            },
            {
              id: "fever",
              label: "وجود حمى عند التشخيص",
              inputType: "boolean",
            },
          ],
        },
        {
          id: "sec-labs",
          title: "النتائج المخبرية",
          questions: [
            {
              id: "wbc",
              label: "تعداد الكريات البيض",
              inputType: "number",
              unit: "×10⁹/L",
              required: true,
            },
            {
              id: "hemoglobin",
              label: "الخضاب (Hb)",
              inputType: "number",
              unit: "g/dL",
            },
            {
              id: "platelets",
              label: "الصفيحات",
              inputType: "number",
              unit: "×10⁹/L",
            },
            {
              id: "blast-percent",
              label: "نسبة الأرومات في نقي العظم",
              inputType: "number",
              unit: "%",
              required: true,
            },
          ],
        },
        {
          id: "sec-classification",
          title: "التصنيف والمخاطر",
          questions: [
            {
              id: "immunophenotype",
              label: "النمط المناعي",
              inputType: "select",
              required: true,
              options: [
                { value: "b-cell", label: "ابيضاض الخلايا البائية (B-ALL)" },
                { value: "t-cell", label: "ابيضاض الخلايا التائية (T-ALL)" },
              ],
            },
            {
              id: "risk-group",
              label: "مجموعة الخطورة",
              inputType: "select",
              required: true,
              options: [
                { value: "standard", label: "خطورة قياسية" },
                { value: "intermediate", label: "خطورة متوسطة" },
                { value: "high", label: "خطورة عالية" },
              ],
            },
            {
              id: "cns-involvement",
              label: "إصابة الجهاز العصبي المركزي",
              inputType: "boolean",
            },
            {
              id: "notes",
              label: "ملاحظات إضافية",
              inputType: "text",
              placeholder: "أي تفاصيل تشخيصية أخرى…",
            },
          ],
        },
      ],
    },
  },
  {
    id: "tpl-solid-v1",
    name: "قالب الورم الصلب",
    version: "1.4",
    description: "توثيق تشخيص ومرحلة الأورام الصلبة لدى الأطفال.",
    cancerType: "ورم صلب",
    isActive: true,
    structure: {
      sections: [
        {
          id: "sec-tumor",
          title: "موقع وطبيعة الورم",
          questions: [
            {
              id: "primary-site",
              label: "الموقع الأولي للورم",
              inputType: "select",
              required: true,
              options: [
                { value: "brain", label: "الدماغ" },
                { value: "kidney", label: "الكلية (ورم ويلمز)" },
                { value: "bone", label: "العظم" },
                { value: "abdomen", label: "البطن (ورم أرومي عصبي)" },
                { value: "soft-tissue", label: "نسيج رخو" },
              ],
            },
            {
              id: "histology",
              label: "النوع النسيجي",
              inputType: "text",
              required: true,
              placeholder: "حسب تقرير التشريح المرضي…",
            },
            {
              id: "biopsy-date",
              label: "تاريخ الخزعة",
              inputType: "date",
            },
          ],
        },
        {
          id: "sec-staging",
          title: "المرحلة والانتشار",
          questions: [
            {
              id: "stage",
              label: "المرحلة",
              inputType: "select",
              required: true,
              options: [
                { value: "I", label: "المرحلة الأولى" },
                { value: "II", label: "المرحلة الثانية" },
                { value: "III", label: "المرحلة الثالثة" },
                { value: "IV", label: "المرحلة الرابعة" },
              ],
            },
            {
              id: "tumor-size",
              label: "أكبر قطر للورم",
              inputType: "number",
              unit: "cm",
            },
            {
              id: "metastasis",
              label: "وجود انتقالات",
              inputType: "boolean",
            },
            {
              id: "metastasis-sites",
              label: "مواقع الانتقالات",
              inputType: "multi-select",
              options: [
                { value: "lung", label: "الرئة" },
                { value: "liver", label: "الكبد" },
                { value: "bone", label: "العظم" },
                { value: "lymph", label: "العقد اللمفية" },
              ],
            },
          ],
        },
        {
          id: "sec-plan",
          title: "التوجه العلاجي المبدئي",
          questions: [
            {
              id: "intent",
              label: "هدف العلاج",
              inputType: "select",
              required: true,
              options: [
                { value: "curative", label: "شفائي" },
                { value: "palliative", label: "ملطّف" },
              ],
            },
            {
              id: "surgery-planned",
              label: "هل الجراحة مخططة؟",
              inputType: "boolean",
            },
            {
              id: "notes",
              label: "ملاحظات",
              inputType: "text",
              placeholder: "ملاحظات حول الخطة المبدئية…",
            },
          ],
        },
      ],
    },
  },
];
