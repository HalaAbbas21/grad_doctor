# Claude Code Prompt — Doctor Dashboard (Pediatric Oncology Platform · Basma)

> Paste everything below into Claude Code. It is written to be executed end-to-end: it contains the design-system implementation, full screen inventory, a per-screen data dictionary, UX rules for non-technical users, and acceptance criteria.

---

## 0. Your mission

You are building the **Doctor application** for a Pediatric Oncology digital platform used by the Basma cancer-support organization. The centerpiece is the **Doctor Dashboard** plus every screen the doctor reaches from it. Build it as a **production-quality, responsive, RTL Arabic** frontend with **mock data only** (no backend — stub all data in `/src/mock` and all writes in local state).

Act as a **senior product designer + software analyst**: before coding, internalize the user, the jobs-to-be-done, and the data each screen needs. Then build clean, well-structured React.

**Definition of "done" up front:** a doctor can log in → pick their department → see a dashboard that tells them exactly what needs their attention → open a patient by file number → review labs → approve a dose → document disease via a dynamic template → build/adjust a treatment plan → and generate a discharge report — all in ≤3 taps per critical action, in Arabic, with no training.

---

## 1. The user (design for them, not for engineers)

**Persona — Dr. layla, pediatric oncologist, 50s.** Highly skilled clinically, **low digital familiarity**. Has never used an EHR-style system. Works long shifts, often on a phone/tablet, sometimes one-handed at the bedside. Stress is high; mistakes are costly. Reads Arabic; English medical abbreviations are acceptable inline.

**Jobs-to-be-done (what the dashboard must answer instantly):**
1. "Which of my patients need me *right now*?" (results back, doses to approve, drafts to finish).
2. "Find this exact child" — fast, unambiguous, by **file number** (names collide constantly).
3. "Is this lab result safe to dose on?" → approve/modify the dose per protocol.
4. "Document and plan treatment" without typing essays.
5. "Hand the family clear next-steps" → discharge report.

**Design consequences (non-negotiable):**
- **File number (رقم الإضبارة) is the primary identity and the default search field everywhere.** Names are secondary and must never be the only disambiguator.
- **Minimal typing.** Dropdowns, chips, steppers, presets, toggles. Free-text only where clinically necessary, with voice-to-text friendliness (large inputs).
- **≤2–3 taps to any critical action.** No deep menu trees.
- **Always-visible patient context bar** once inside a patient, so the doctor never loses track of *who* they're acting on.
- **Plain, reassuring language** + **status by color** (see semantics). Every destructive/clinical action gets a confirm step; every save shows an explicit "saved" state.
- **Autosave drafts** at every stage (the doctor can be interrupted at any moment).

---

## 2. Tech stack & setup

- **React 18 + Vite + TypeScript (TSX) — required.** All components, props, mock data, and the data-model types in §7 must be **fully typed** (no `any`; define interfaces/types for every entity). Strict mode on in `tsconfig`.
- **Responsive across phone, tablet, and desktop — required** (the doctor may enter the system from any of the three). See §2.1.
- **Tailwind CSS** + **shadcn/ui** (Button, Card, Input, Select, Badge, Tabs, Dialog, Sheet, Table, Toast, Tooltip, Progress, Skeleton, Avatar, Command for search).
- **Routing:** React Router. **State:** lightweight (Zustand or React context) — current doctor, current department, selected patient, drafts, notifications.
- **Icons:** lucide-react. **Charts (timeline/progress):** keep light; a custom horizontal stage timeline is fine.
- **i18n/RTL:** app is **RTL Arabic by default**. Set `dir="rtl"` and `lang="ar"` on `<html>`. Keep all UI strings in one `ar.ts` dictionary (glossary in §12) so they're easy to review.
- **No backend.** Mock everything (§8–§9). Simulate latency + states (loading/empty/error) so the UX is realistic.

### 2.1 Responsive design (phone · tablet · desktop) — first-class requirement
The same doctor uses this system from a **phone at the bedside, a tablet on rounds, or a desktop in the office**. Build mobile-first, then progressively enhance. Every screen in §6 must be usable and well-proportioned at all three sizes — no horizontal scroll, no clipped content, no tiny tap targets on mobile.

**Breakpoints (Tailwind):** `sm 640 · md 768 · lg 1024 · xl 1280`. Treat them as:
- **Phone (<768px):** single column. **Bottom tab bar** for primary nav. Top bar condenses (logo + search icon that opens full-screen Command search + notifications bell + avatar). Dashboard count cards stack 1–2 per row; tables render as **stacked cards**; patient context bar is sticky and collapsible; multi-step flows (documentation, plan, dose) are full-screen steppers. One-handed reach: primary CTA pinned bottom where natural.
- **Tablet (768–1023px):** 2-column content where it helps (e.g., patient overview + side panel). Nav may be a **collapsible sidebar** or persistent bottom bar (pick one and keep it consistent). Count cards 2–3 per row; tables become responsive tables or two-column cards.
- **Desktop (≥1024px):** **persistent sidebar** nav; multi-column dashboard (priority row 5 across, queue + appointments side by side); full data tables; patient 360° uses tabs with a wider reading column and a right rail for the context/summary. Cap content width (~1280px) and center.

**Rules:** fluid layouts (flex/grid + `min/max` widths, not fixed px); images/PDF viewer scale to container; modals become **bottom sheets** on phone and centered dialogs on desktop; **all of this mirrored for RTL**. Test each screen at ~375px, ~768px, and ~1280px.

---

## 3. Design system — implement exactly

**Light mode only. oklch values are the source of truth; hex are accurate fallbacks.** Define tokens as CSS custom properties on `:root`, then map shadcn tokens to them.

### 3.1 Color tokens (CSS variables)
```css
:root {
  --background: oklch(0.992 0.005 220);      /* #F9FDFF */
  --foreground: oklch(0.255 0.045 250);      /* #112438 */
  --card: oklch(1 0 0);                        --card-foreground: oklch(0.255 0.045 250);
  --popover: oklch(1 0 0);                     --popover-foreground: oklch(0.255 0.045 250);

  --primary: oklch(0.62 0.16 240);           /* #008FD2 blue — trust/care, main actions */
  --primary-foreground: oklch(0.99 0.005 240);
  --primary-soft: oklch(0.95 0.04 240);      /* #DFF1FF */

  --secondary: oklch(0.74 0.16 150);         /* #51C672 green — success/progress/positive */
  --secondary-foreground: oklch(0.22 0.05 150);
  --secondary-soft: oklch(0.95 0.05 150);

  --accent: oklch(0.62 0.17 320);            /* #B25EC5 purple — badges/tags/supporting */
  --accent-foreground: oklch(0.99 0.005 320);
  --accent-soft: oklch(0.95 0.04 320);

  --highlight: oklch(0.86 0.16 90);          /* #FACB39 yellow — CTA highlight/celebration */
  --highlight-foreground: oklch(0.28 0.06 80);
  --highlight-soft: oklch(0.97 0.06 95);

  --muted: oklch(0.965 0.012 240);            --muted-foreground: oklch(0.52 0.03 250);
  --destructive: oklch(0.62 0.22 25);         --destructive-foreground: oklch(0.99 0.005 25);
  --success: oklch(0.7 0.16 155);             --success-foreground: oklch(0.99 0.005 155);
  --warning: oklch(0.82 0.15 80);             --warning-foreground: oklch(0.28 0.06 80);

  --border: oklch(0.92 0.015 240);            --input: oklch(0.93 0.015 240);
  --ring: oklch(0.62 0.16 240);
  --radius: 1rem; /* base 16px */
}
```
Derived radii: `sm ~12px, md ~14px, lg 16px, xl 20px, 2xl 24px, 3xl 28px, 4xl 32px`. **When inventing new tints, keep the hue angle and adjust only lightness/chroma.**

### 3.2 Typography
- **Body / UI:** `Nunito` (400, 600, 700, 800).
- **Display / headings (H1–H4, brand):** `Quicksand` (500, 600, 700), `letter-spacing: -0.01em`.
- **Arabic / RTL content:** `Tajawal` (400, 500, 700) — **this is the primary font for the Arabic UI.** Use Quicksand only for Latin/brand display; Tajawal carries Arabic headings and body.
- Enable antialiasing (`-webkit-font-smoothing: antialiased`).

### 3.3 Surface background (not flat)
Page background = **Surface gradient** layered over `#F9FDFF`: soft **blue radial glow top-start** + **yellow radial glow top-end**, very subtle. Implement on the app shell, behind cards.

### 3.4 Brand gradients (use sparingly for hero/celebration only)
- Brand `135°: #008FD2 → #B25EC5 → #51C672`
- Sun `135°: #FACB39 → #F5C06A`
- Hope `135°: #51C672 → #008FD2`
- Care `135°: #B25EC5 → #008FD2`

### 3.5 Component styling
- **Button variants:** `default` = primary blue, white text, shadow, hover 90% opacity · `destructive` = red · `outline` = bordered on background, hover → accent-soft + accent text · `secondary` = green, dark-green text, hover 80% · `ghost` = transparent, hover → accent-soft + accent · `link` = blue, underline on hover.
- **Card:** `rounded-xl border bg-white shadow`; Header `p-6`, Title `font-semibold tracking-tight`, Description `text-sm text-muted-foreground`; Content `p-6 pt-0`; Footer `flex items-center p-6 pt-0`.
- **Color semantics — apply consistently:** blue = primary actions/links/headings; green = success/progress/positive; purple = badges/tags/supporting accents; yellow = the single most important CTA on a screen + celebratory moments; red = destructive/critical alerts only.

---

## 4. UX rules for low-familiarity clinical users (enforce on every screen)

1. **One primary action per screen**, styled as the boldest button (blue, or yellow for a celebratory/hero CTA). Secondary actions are quieter.
2. **Progressive disclosure:** show the essentials; tuck detail behind "More" / expandable sections. The dashboard and patient overview must be scannable in <5 seconds.
3. **Guided flows (steppers/wizards)** for multi-part tasks (treatment plan, disease documentation, dose approval). Show step X of Y, allow back, autosave each step.
4. **Status as color + icon + label** (never color alone — accessibility). Map clinical states to tokens (see §7 per screen).
5. **Confirm + undo** for clinical writes (dose approval, submitting documentation, generating discharge). Toasts confirm success in green.
6. **Empty, loading, error states** for every list/data area (skeletons, friendly empty illustrations/text, retry).
7. **Patient safety affordances:** the patient context bar shows file number + name + age + diagnosis + life-status badge + any critical flag; require it to match before any clinical write.
8. **Tap targets ≥44px**, generous spacing, large readable Arabic type. Works one-handed on a phone.
9. **No dead ends:** every screen has a clear back/next and a way to reach search and notifications.

---

## 5. Information architecture & navigation

**App shell** (persistent):
- **Top bar:** brand/logo · **Department switcher** (العيادة / النهاري / الداخلي) showing the active department · **global search** (file-number-first, opens a Command palette) · **notifications bell** with unread count · doctor avatar/profile menu.
- **Primary nav** (sidebar on desktop, bottom tab bar on mobile): **الرئيسية (Dashboard)** · **المرضى (Patients)** · **المخبر (Labs)** · **الإشعارات (Notifications)** · **حسابي (Profile)**.
- **Patient context bar:** appears at top of all patient-scoped screens; sticky.

**Route map:**
```
/login
/select-department
/                         → Dashboard (home)
/patients                 → Patient queue/list (current department)
/patients/:fileNo         → Patient record (360°) with tabbed sections
/patients/:fileNo/document→ Disease documentation (dynamic template)
/patients/:fileNo/lab-request
/patients/:fileNo/results → Lab results review
/patients/:fileNo/dose    → Dose approval (per protocol)
/patients/:fileNo/plan    → Treatment plan builder
/patients/:fileNo/discharge → Discharge report
/labs                     → Lab requests/results overview for the doctor
/notifications
/profile
```

---

## 6. Screen-by-screen specification

> For each screen: **Purpose · Layout · Data shown · Data captured (inputs) · Components · States · Design notes.** Build all of them.

### 6.1 Login + Department selector
- **Purpose:** secure entry, then set the shift's working department (drives the dashboard and patient lists).
- **Login data:** username, password, plus a **PIN / biometric** affordance (mock the biometric as a button). Show lockout message after N failed attempts (mock).
- **Department selector:** three large cards — **العيادة (Clinic)**, **القسم النهاري (Day Care)**, **القسم الداخلي (Inpatient)** — each with icon, one-line purpose, and today's patient count. Selecting one sets context and routes to Dashboard. Department is changeable later from the top bar.
- **Design:** hero uses Brand gradient sparingly; cards are white, rounded-xl, large tap targets.

### 6.2 Dashboard (home) — the heart of the build
- **Purpose:** answer "what needs me now?" in <5s, scoped to the active department.
- **Layout (top→bottom):**
  1. **Greeting strip:** "مرحباً د. {name}" · specialization · **active department** (with switch link) · date.
  2. **Prominent file-number search** ("ابحث برقم الإضبارة…") — the fastest path to a patient.
  3. **Action-needed cards (the priority row)** — each is a tappable count that deep-links to a filtered list:
     - **نتائج بانتظار المراجعة** (lab results to review) — count, blue.
     - **جرعات بانتظار الإقرار** (doses to approve per protocol) — count, **highlight/yellow** (most urgent CTA).
     - **مسودات غير مكتملة** (incomplete drafts — documentation/plans) — count, purple.
     - **تقارير تخريج معلّقة** (discharge reports pending) — count, blue.
     - **نتائج جديدة من مخابر خارجية** (new external lab results) — count, green.
  4. **Today's queue (current department):** list of waiting patients with **token number, file number, name, age, diagnosis, waiting time, status**; tap → patient record. (In Clinic this is new/follow-up patients; in Day Care/Inpatient it's dosing patients.)
  5. **Today's appointments:** time, patient (file no + name), type (متابعة / فحص أولي), status.
  6. **Notifications feed (compact):** latest 3–5; link to full center.
- **Data shown:** doctor profile summary; per-department counts; queue items; appointments; notifications.
- **States:** skeleton cards while loading; empty state per section ("لا يوجد ما يتطلب انتباهك الآن ✅" in green).
- **Design notes:** the priority row is the screen's anchor. Use soft token backgrounds (`*-soft`) for the count cards with the strong token for the number. Exactly one yellow card (doses) as the hero CTA.

### 6.3 Patient queue / list
- **Purpose:** browse/triage patients in the active department.
- **Data shown per row:** token, **file number (bold, primary)**, full name, age, gender, diagnosis/cancer type, current treatment phase, status badge, waiting time, quick actions (open, request lab, approve dose).
- **Inputs/controls:** **search (file number default, name secondary)**, filters (status, phase, appointment type), sort (waiting time, name). 
- **Components:** shadcn Table (cards on mobile), Command palette search, Badge for status.
- **Status badges → tokens:** بانتظار التحليل (warning) · النتيجة جاهزة (primary) · بانتظار إقرار الجرعة (highlight) · قيد العلاج (secondary/green) · مكتمل (muted) · حالة حرجة (destructive).

### 6.4 Patient record (360° view)
- **Purpose:** complete, safe view of one child; launch point for all clinical actions.
- **Patient context bar (sticky, on this and all patient screens):** **file number (Basma) — primary**, file number (Biruni `xxxx/yyyy`), full name (first/family/father/mother), DOB + **computed age**, gender, national ID, **life-status badge** (حياة / وفاة / انقطاع عن العلاج / فقد متابعة / غير معروفة), current department, diagnosis, current phase, **critical flags** (allergies/alerts if any), guardian contact quick-action.
- **Tabbed sections (data shown in each):**
  - **نظرة عامة (Overview):** summary of diagnosis, active treatment phase + progress, last/next dose dates, latest vitals snapshot, latest lab status, open drafts, last discharge report.
  - **المعلومات السكانية (Demographics):** all registration fields (read; doctor edits where permitted) — names, DOB, gender, national IDs (patient + father), family-registry country/governorate/city, residence country/governorate/city, nationality (سوري / سوري فلسطيني / أخرى), caregiver (الأب والأم / الأب فقط / الأم فقط / الجد أو الجدة / العم أو الخال أو العمة أو الخالة / جهة أخرى), caregiver education (أمّي / ابتدائي / إعدادي / ثانوي / جامعي), phones (father/mother/caregiver/extra), referral info (date, country, referring center, referring-doctor specialty, referral pattern).
  - **توثيق المرض (Disease documentation):** list of completed/draft template instances (template name, version, date, status); open to view/edit.
  - **خطة العلاج (Treatment plan):** plan name, start/estimated-end dates, **horizontal stage timeline** (Induction/Consolidation/… with status colors), per-stage meds & dates; edit launches the builder.
  - **التحاليل (Labs):** request history + results — test type, target lab (داخلي/خارجي), priority, status (معلق/مقبول/مرفوض + سبب/النتائج متوفرة), request date, result date, **PDF view/download**.
  - **العلامات الحيوية (Vitals — from nurse):** weight, height, temperature, pulse, blood pressure, respiratory rate, with timestamps (read-only for doctor; trend list).
  - **الملاحظات (Notes):** doctor's clinical notes (add/view), timestamped, authored.
  - **تقارير التخريج (Discharge reports):** history; open to view; "+ تقرير تخريج جديد".
  - **المواعيد (Appointments):** date/time, type, status, assigned staff.
- **Primary actions (toolbar):** طلب فحص · مراجعة النتائج · إقرار الجرعة · توثيق المرض · خطة العلاج · تقرير تخريج · تحديد الوجهة (داخلي/نهاري) · إضافة ملاحظة.

### 6.5 Disease documentation (dynamic template)
- **Purpose:** document diagnosis/treatment via a **template chosen by cancer type** with minimal typing; supports **save as draft**.
- **Flow:** select template (name + version, searchable) → render the **dynamic form from a JSON schema** (sections → questions → input types: select, multi-select chips, number, date, boolean toggle, short text) → fill → **حفظ كمسودة** anytime / **حفظ وتقديم** at the end.
- **Data captured:** templateId, patient (context), per-field answers (validated against schema), status (draft/submitted), createdAt/lastModified, authoring doctor.
- **UX:** stepper per section; progress bar; mandatory fields flagged; autosave draft with explicit "تم الحفظ" indicator; validate only on final submit.
- **Provide 2 example JSON templates** in mock (e.g., "قالب تشخيص ALL", "قالب ورم صلب") with realistic sections so the dynamic renderer is demonstrably working.

### 6.6 Lab request
- **Purpose:** order one or more tests, internal or external, in ≤3 taps.
- **Data captured:** patient (context, locked), **target laboratory** with **داخلي / خارجي toggle** (filter lab list accordingly), **test type(s)** (multi-select chips), **clinical indication** (short text/optional), **priority** (روتيني / عاجل / طارئ — segmented control), **date required** (optional). 
- **On submit:** create request with status معلق; toast success; show it in the patient's Labs tab. **Multiple tests in one request** must be supported.
- **States:** validate mandatory fields; error if chosen lab can't run a selected test (mock this rule). External-lab requests show an info note that results arrive via notification.

### 6.7 Lab results review
- **Purpose:** review results and decide; the safe gate before dosing.
- **Data shown:** list of results per patient (test type, lab, priority, result date, status), **PDF viewer + download**, and a **"إقرار الجرعة" CTA** when a result is tied to a pending dose.
- **States:** download-failure error; "no results yet" empty; highlight newly arrived (esp. external) results.

### 6.8 Dose approval (per protocol)
- **Purpose:** the doctor approves/modifies the dose **after** reviewing the pre-dose lab — the system's safety hinge.
- **Layout (guided):**
  1. **Context:** patient bar + current **protocol stage**, last dose date, cycle/visit.
  2. **Pre-dose lab summary:** the relevant result + status (link to PDF). Block approval if no reviewed result exists (enforce the "lab-before-dose" rule).
  3. **Recommended dose** per protocol (from mock plan) shown read-clearly.
  4. **Decision:** **إقرار الجرعة** (primary) or **تعديل الجرعة** (opens dose/notes fields) — capture: approved dose, optional adjustment reason, notes.
  5. **Send to nurse:** confirm → toast → updates patient status to "بانتظار إعطاء الجرعة".
- **UX:** big confirm; cannot proceed without a reviewed lab; show clearly *who* the dose is for (context bar).

### 6.9 Treatment plan builder
- **Purpose:** create/adjust a multi-stage protocol with structured input, not prose.
- **Plan fields:** plan name, start date, estimated end date, overall description (optional), **phases[]**.
- **Per stage (card, repeatable):** stage name (preset chips: مرحلة الحث / التوحيد / الصيانة / + مخصّص), start date, end date, **medications[]** (name, dose, schedule), procedures, cycles, visits, milestones, status (قيد التقدم / مكتملة / معلقة).
- **UX:** add/reorder stage cards; **horizontal timeline preview** updates live with status colors (green=completed, blue=in-progress, muted=pending); **save draft**; validate that stages are chronologically ordered before final save.

### 6.10 Discharge report (doctor-exclusive)
- **Purpose:** the end-of-stage handoff to the family; **only the doctor can create/edit**; the guardian can later export it.
- **Data captured:** patient (context), **last dose date**, **prescription** (medications with dose + instructions — repeatable rows), **doctor instructions** (follow-up text), **next dose date**, **next-visit destination** (القسم الداخلي / النهاري), and it auto-stamps generatedBy + generatedAt.
- **On generate:** preview a clean, printable/exportable card; confirm → save to patient's discharge history; toast (celebratory green) — this is a "done" moment.
- **UX:** structured rows over free text; show a live preview of what the family will see/export.

### 6.11 Notifications center
- **Data shown per item:** type (تنبيه/معلومة/تذكير) with icon+color, message, **related patient (file number + name)**, timestamp, read/unread. Tapping deep-links to the relevant screen (e.g., new external result → results review).
- **Controls:** mark read / mark all read; filter by type. Unread count drives the bell badge.

### 6.12 Profile / department switch (light)
- Doctor profile (name, specialization, professional status/ID, contact), active department switcher, secure-login settings placeholder, logout.

---

## 7. Data dictionary (build mock types from this)

**Doctor:** id, firstName, lastName, specialization, professionalStatus (أخصائي/مقيم), professionalId, contactEmail, contactPhone, currentDepartment.

**Patient:** fileNoBasma (PRIMARY), fileNoBiruni (`xxxx/yyyy`), electronicFileDate, basmaFileOpenDate, biruniFileOpenDate, nationalIdPatient, nationalIdFather, firstName, familyName, fatherName, motherName, dob, age(computed), gender, nationality, familyRegistry{country,governorate,city}, residence{country,governorate,city}, caregiver, caregiverEducation, phones{father,mother,caregiver,extra}, referral{date,country,center,referringDoctorSpecialty,pattern}, generalTreatment{receivedInitialAtBasma, initialStartDate, initialType, noCurativeReason, palliativeType, lastVitalStatus}, followUp{lastVitalStatusDate, vitalStatusSource, deathDate, deathCause, deathPlace, deathCity, deathGovernorate, deathCountry}, lifeStatus, diagnosis, currentPhase, criticalFlags[], department, registrationDate.

**Vitals (by nurse):** weight, height, temperature, pulse, bloodPressure, respiratoryRate, recordedAt.

**DiseaseDocumentation:** id, patientFileNo, doctorId, templateId, templateName, version, data(JSON answers), status(draft/submitted), createdAt, lastModifiedAt.

**MedicalTemplate:** id, name, version, description, structure(JSON: sections→questions→inputType), isActive.

**LabTestRequest:** id, patientFileNo, doctorId, laboratoryId, labKind(internal/external), testType(s), clinicalIndication, priority(routine/urgent/emergency), dateRequired, requestDate, status(pending/accepted/rejected/results-available), rejectionReason, resultFilePath, resultUploadDate.

**TreatmentPlan:** id, patientFileNo, doctorId, planName, startDate, estimatedEndDate, overallDescription, phases[]. **TreatmentStage:** id, planId, stageName, startDate, endDate, description, medications[], procedures, cycles, visits, milestones, status.

**DischargeReport:** id, patientFileNo, doctorId, stageRef, lastDoseDate, prescription[{med,dose,instructions}], doctorInstructions, nextDoseDate, nextVisitDepartment, generatedAt, exportable.

**Appointment:** id, patientFileNo, doctorId, dateTime, type, status, assignedStaff, notes.

**Notification:** id, userId, type(alert/info/reminder), message, relatedPatientFileNo, timestamp, isRead.

---

## 8. Mock data requirements
- Seed **~12–15 patients** spread across the three departments, with varied life statuses, phases, and pending states so every dashboard count and every status badge is demonstrable.
- Include patients with: a result waiting to be reviewed, a dose waiting for approval, an incomplete draft, a pending discharge, and a new external-lab result — so the dashboard priority row shows non-zero counts.
- Provide **2 working JSON medical templates** and **2 sample treatment plans** with multiple stages.
- Provide a few mock PDF result URLs (placeholder) for the viewer/download flow.
- Simulate latency (e.g., 400–800ms) and let users trigger an error state somewhere (e.g., a "fail download" toggle) to prove states are handled.

---

## 9. Accessibility & RTL
- `dir="rtl"`, `lang="ar"`, mirror all layouts (icons, chevrons, progress, timelines flow right→left).
- Status never by color alone — pair with icon + Arabic label.
- WCAG AA contrast using the tokens; visible focus ring (`--ring`).
- Min 44px tap targets; supports text scaling; keyboard navigable.

---

## 10. Acceptance criteria (Definition of Done)
1. Login → department selection → dashboard works; department switch updates dashboard + patient list.
2. File-number search finds a patient in ≤2 taps from anywhere.
3. Dashboard priority row shows live, accurate counts and deep-links to filtered lists.
4. Patient 360° shows all sections from §6.4 with the sticky context bar (file number primary).
5. Disease documentation renders **dynamically from JSON**, supports draft + submit with autosave indicator.
6. Lab request supports internal/external + multi-test + priority; appears in the patient's Labs tab.
7. Results review shows PDF view/download and gates dose approval.
8. **Dose approval cannot proceed without a reviewed pre-dose lab** (lab-before-dose enforced).
9. Treatment plan builder produces a live stage timeline; chronological validation on save.
10. **Discharge report is doctor-only**, captures all §6.10 fields, and renders an exportable preview.
11. Every list/data area has loading, empty, and error states.
12. Design tokens, fonts (Tajawal/Nunito/Quicksand), radii, gradients, and Surface ambient background match §3 exactly. Light mode only.
13. **Fully responsive and verified at phone (~375px), tablet (~768px), and desktop (~1280px)** per §2.1: bottom-tab nav + one-handed usability and stacked-card tables on phone; collapsible/sidebar nav and multi-column layouts on tablet/desktop; modals → bottom sheets on phone; all mirrored for RTL. No horizontal scroll or clipped content at any size.
14. **Written in TypeScript with full typing** — every entity in §7 has an interface/type, components are typed, `tsconfig` is strict, and the project builds with no type errors.

---

## 11. Arabic UI glossary (use these strings)
| English | Arabic |
|---|---|
| Dashboard | الرئيسية / لوحة الطبيب |
| Patients | المرضى |
| File number | رقم الإضبارة |
| Clinic / Day Care / Inpatient | العيادة / القسم النهاري / القسم الداخلي |
| Search by file number | ابحث برقم الإضبارة |
| Results to review | نتائج بانتظار المراجعة |
| Doses to approve | جرعات بانتظار الإقرار |
| Incomplete drafts | مسودات غير مكتملة |
| Pending discharge reports | تقارير تخريج معلّقة |
| New external lab results | نتائج جديدة من مخابر خارجية |
| Today's queue / appointments | قائمة اليوم / مواعيد اليوم |
| Disease documentation | توثيق المرض |
| Medical template | القالب/النموذج الطبي |
| Lab request | طلب فحص مخبري |
| Internal / External lab | مخبر داخلي / مخبر خارجي |
| Priority: routine/urgent/emergency | الأولوية: روتيني / عاجل / طارئ |
| Lab results review | مراجعة نتائج المختبر |
| Dose approval | إقرار الجرعة |
| Modify dose | تعديل الجرعة |
| Send to nurse | إرسال إلى الممرضة |
| Treatment plan | خطة العلاج |
| Stages: Induction/Consolidation/Maintenance | مراحل: الحث / التوحيد / الصيانة |
| Discharge report | تقرير التخريج |
| Last dose date | تاريخ آخر جرعة |
| Prescription | الوصفة الطبية |
| Doctor's instructions | تعليمات الطبيب |
| Next dose date | موعد الجرعة القادمة |
| Next destination | الوجهة القادمة |
| Vitals | العلامات الحيوية |
| Notes | الملاحظات |
| Notifications | الإشعارات |
| Save as draft / Save & submit | حفظ كمسودة / حفظ وتقديم |
| Saved | تم الحفظ |
| Life status badges | حياة / وفاة / انقطاع عن العلاج / فقد متابعة / غير معروفة |

---

## 12. Deliverables & structure
- A runnable Vite app (`npm install && npm run dev`).
- Suggested structure: `src/app` (shell, routing), `src/screens/*`, `src/components/*` (shared + patient-context-bar, count-card, stage-timeline, dynamic-form-renderer), `src/mock` (data + types), `src/i18n/ar.ts`, `src/styles/tokens.css`.
- A short `README.md`: how to run, where mock data lives, how to add a template, and a screen index.

## Non-goals (do not build)
- No backend/API, no auth server (mock login).
- No other roles (nurse/reception/lab/admin) — Doctor only.
- No dark mode. No real PDF generation engine — a clean printable preview is enough.

**Build it screen by screen, starting with the design-system tokens + app shell + patient context bar, then the Dashboard, then patient-scoped screens. Keep components small and reusable. Prioritize clarity for a non-technical doctor over visual density.**
