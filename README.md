# بسمة — تطبيق الطبيب (Doctor Dashboard)

منصّة أورام الأطفال — تطبيق الطبيب. واجهة **عربية RTL** عالية الجودة، **متجاوبة** (هاتف · لوحي · سطح مكتب)، مبنية بـ **React 18 + Vite + TypeScript + Tailwind**، مع **بيانات وهمية فقط** (لا يوجد backend).

> A production-quality, responsive, RTL-Arabic frontend for the Basma pediatric-oncology Doctor application. Mock data only — every write lives in local state (Zustand).

---

## التشغيل / Running

```bash
npm install
npm run dev        # خادم التطوير على http://localhost:5173
npm run build      # فحص الأنواع (tsc) + بناء الإنتاج
npm run preview    # معاينة بناء الإنتاج
npm run typecheck  # فحص الأنواع فقط
```

**الدخول:** أي بيانات تعمل (نظام تجريبي). بعد الدخول اختر القسم (العيادة / النهاري / الداخلي) ثم تصل إلى لوحة الطبيب.

---

## أين توجد البيانات الوهمية؟ / Where mock data lives

كل البيانات في `src/mock/`:

| الملف | المحتوى |
|---|---|
| `types.ts` | كل أنواع النموذج (§7) — مُصنّفة بالكامل، بدون `any`. |
| `patients.ts` | ~14 مريضاً موزّعين على الأقسام الثلاثة بحالات متنوّعة. |
| `templates.ts` | **قالبان طبيّان (JSON)**: تشخيص ALL، والورم الصلب. |
| `laboratories.ts` | المخابر الداخلية/الخارجية وأنواع الفحوص. |
| `seed.ts` | الطبيب، العلامات الحيوية، الفحوص، التوثيقات، الخطط، المواعيد، الملاحظات، تقارير التخريج. |
| `notifications.ts` | الإشعارات. |

الحالة القابلة للتعديل تُدار في `src/store/useAppStore.ts` (Zustand)، والعدّادات المشتقّة في `src/store/selectors.ts`.

يحاكي التطبيق زمن استجابة الشبكة (`useMockLoad`)، ويمكن تفعيل **حالة فشل التنزيل** من شاشة مراجعة النتائج لإثبات معالجة حالات الخطأ.

---

## كيف تضيف قالباً طبياً جديداً؟ / How to add a template

أضف كائناً جديداً إلى المصفوفة في [`src/mock/templates.ts`](src/mock/templates.ts). يُبنى النموذج ديناميكياً من `structure.sections[].questions[]`. أنواع الإدخال المدعومة:

`select` · `multi-select` · `number` · `date` · `boolean` · `text`

```ts
{
  id: "tpl-xxx",
  name: "اسم القالب",
  version: "1.0",
  description: "...",
  cancerType: "...",
  isActive: true,
  structure: {
    sections: [
      {
        id: "sec-1",
        title: "القسم الأول",
        questions: [
          { id: "q1", label: "سؤال", inputType: "select", required: true,
            options: [{ value: "a", label: "خيار أ" }] },
        ],
      },
    ],
  },
}
```

سيظهر القالب تلقائياً في شاشة *توثيق المرض* ويُعرض عبر `DynamicField`.

---

## فهرس الشاشات / Screen index

| المسار | الشاشة |
|---|---|
| `/login` | تسجيل الدخول (+ بصمة / رمز سري، رسالة قفل) |
| `/select-department` | اختيار القسم |
| `/` | لوحة الطبيب (الرئيسية) — صف الأولويات، قائمة اليوم، المواعيد، الإشعارات |
| `/patients` | قائمة/فرز مرضى القسم (بحث برقم الإضبارة) |
| `/patients/:fileNo` | ملف المريض 360° (تبويبات: نظرة عامة، سكاني، توثيق، خطة، تحاليل، علامات حيوية، ملاحظات، تخريج، مواعيد) |
| `/patients/:fileNo/document` | توثيق المرض (قالب ديناميكي + مسودة + حفظ تلقائي) |
| `/patients/:fileNo/lab-request` | طلب فحص (داخلي/خارجي + متعدد + أولوية) |
| `/patients/:fileNo/results` | مراجعة النتائج (عرض/تنزيل PDF + بوابة الجرعة) |
| `/patients/:fileNo/dose` | إقرار الجرعة (يُمنع قبل مراجعة التحليل) |
| `/patients/:fileNo/plan` | بناء خطة العلاج (مخطط زمني حيّ + تحقق زمني) |
| `/patients/:fileNo/discharge` | تقرير التخريج (للطبيب فقط + معاينة حيّة) |
| `/labs` | نظرة عامة على الفحوص والنتائج |
| `/notifications` | مركز الإشعارات |
| `/profile` | الحساب + تبديل القسم |

---

## بنية المشروع / Structure

```
src/
  app/            ← هيكل التطبيق (AppShell, GlobalSearch)
  screens/        ← كل شاشة من §6
  components/     ← مكوّنات مشتركة
    ui/           ← عناصر shadcn-style (Button, Card, Dialog, Toast…)
    PatientContextBar · CountCard · StageTimeline · DynamicField · Stepper · …
  store/          ← Zustand store + selectors
  mock/           ← الأنواع + البيانات الوهمية
  i18n/ar.ts      ← قاموس النصوص العربية + خرائط الحالات
  lib/utils.ts    ← أدوات (cn, التواريخ, العمر, التأخير)
  styles/         ← tokens.css (متغيّرات التصميم) + index.css
```

---

## نظام التصميم / Design system

- **الوضع الفاتح فقط.** متغيّرات `oklch` في [`src/styles/tokens.css`](src/styles/tokens.css) هي مصدر الحقيقة.
- الألوان: أزرق (أساسي) · أخضر (نجاح/تقدّم) · بنفسجي (وسوم) · أصفر (أهم إجراء/احتفال) · أحمر (حرج فقط).
- الخطوط: **Tajawal** (عربي أساسي) · Nunito (واجهة) · Quicksand (عناوين لاتينية/علامة).
- خلفية محيطة متدرّجة (`.surface-bg`)، تدرّجات العلامة للأبطال فقط.
- الحالة دائماً **لون + أيقونة + نص** (ليست لوناً وحده) — راجع `StatusBadge`.

## التجاوب / Responsive (§2.1)
- **هاتف (<768px):** عمود واحد، شريط تبويب سفلي، جداول كبطاقات مكدّسة، النوافذ كـ bottom-sheet.
- **لوحي (768–1023px):** أعمدة مزدوجة حيث يفيد.
- **سطح مكتب (≥1024px):** شريط جانبي ثابت، تخطيطات متعدّدة الأعمدة، عرض محدود بـ 1280px.

كل ذلك **معكوس لـ RTL**. تم التحقق عند ~375px و~768px و~1280px.

## غير مشمول / Non-goals
لا backend، لا أدوار أخرى (ممرضة/استقبال/مخبر)، لا وضع داكن، لا محرّك PDF حقيقي (معاينة قابلة للطباعة تكفي).
