


You are correcting three places where this frontend's domain model diverges from the real backend. The backend is already deployed and is the source of truth. **In all three cases the backend design is correct and the frontend must change to match — not the other way around.**

This task operates on the current data source (mock or API, whichever is wired). It is a model + UI restructuring task.

## Guardrails

- **Do not touch** the design system (tokens, Tajawal/Nunito/Quicksand, gradients, radii, Surface background), RTL Arabic, or the responsive layouts. Visual language stays identical.
- Reuse existing components (cards, badges, steppers, toasts, empty/loading/error states). Do not invent a new visual pattern for anything here.
- `tsconfig` stays strict. `npm run build` must pass with zero type errors after **each** of the three parts.
- No-delete policy stands: nothing gains a delete action.
- Where the backend's exact response shape is not stated below, it is **genuinely unknown**. Type it defensively and mark it `// TODO(api-contract):` — do not fabricate fields.

Do the three parts **in the order given**, and commit after each. If a part breaks the build, fix it before moving on.

---

# PART 1 — `department` enum: silent-bug fix (do this first)

## The problem

| | values |
|---|---|
| Backend | `clinic` · `daycare` · `inpatient` |
| This frontend | `clinic` · `dayCare` · `inpatient` |

`dayCare` exists nowhere but in this codebase. When it reaches the API as a filter, the server matches nothing and returns an empty list with **HTTP 200 and no error** — an empty Day Care queue that looks like a real, quiet day. This is the worst class of bug: it never announces itself.

## The fix

The backend value wins. Rename the domain value `dayCare` → `daycare` everywhere, and make it impossible to typo again.

### 1. Single source of truth

Create `src/constants/departments.ts`:

```ts
export const DEPARTMENTS = ['clinic', 'daycare', 'inpatient'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS_AR: Record<Department, string> = {
  clinic: 'العيادة',
  daycare: 'القسم النهاري',
  inpatient: 'القسم الداخلي',
};

export function isDepartment(v: unknown): v is Department { /* … */ }
```

The wire value is lowercase; the **Arabic label is what users see**, so nothing about the UI changes. Only the code-level string changes.

### 2. Propagate

- `src/types/schema.ts`: every `'clinic' | 'dayCare' | 'inpatient'` union → `Department` imported from the constants module.
- Replace **every** raw department string literal in the codebase with the type or a constant. After this part there must be zero occurrences of `'dayCare'` and zero inline department string unions outside `src/constants/departments.ts`. Grep to verify.
- Update mock data, the i18n dictionary (`src/i18n/ar.ts`) if it keys off department, and any route/query param defaults.

### 3. ★ Persisted-state migration (do not skip)

If the active department is persisted anywhere — a Zustand `persist` store, `localStorage`, a URL query param, a cookie — a returning user still holds the **old** `"dayCare"` string. After the rename that value fails `isDepartment()` and the app may land on a blank or broken screen on first load after deploy.

Add a rehydration guard: on reading a persisted department, if the value is not a valid `Department`, coerce `"dayCare" → "daycare"` and otherwise fall back to `'clinic'`. Never let an unrecognized persisted value reach a screen.

### Part 1 acceptance

1. `grep -r "dayCare" src/` returns nothing.
2. Department string literals exist only in `src/constants/departments.ts`.
3. Switching departments works; each department's list/queue shows its own data.
4. A user with `"dayCare"` in `localStorage` loads without error and lands on Day Care.
5. Build clean. No visual change anywhere.

---

# PART 2 — `consult-requests`: a backend resource the app is missing

## The problem

The backend has a full consultation-request resource that this app never models. Reception creates the requests; **the doctor's job is to see them and mark them coordinated.**

## Verified backend contract

```http
GET   /consult-requests?perPage=15&status=pending
PATCH /consult-requests/{id}/coordinate
```

The doctor role has **only these two**. Reception owns creation (`POST`) — do **not** add a create form to the Doctor app.

Related field, already in the contract: `Patient.consultation_needs: ConsultationType[]`.

```ts
type ConsultationType = 'cardiac' | 'neurological' | 'ophthalmic' | 'ent' | 'surgery' | 'other';
```

## The fix

### 1. Domain type

Add to `src/types/schema.ts`:

```ts
export interface ConsultRequest {
  id: string;
  patientFileNo: string;
  consultationType: ConsultationType;
  notes?: string;
  status: 'pending' | 'coordinated';   // TODO(api-contract): only 'pending' is confirmed
  createdAt: string;
  coordinatedAt?: string;
  coordinatedBy?: string;
}
```

Only `status=pending` is confirmed from the collection. Treat any unrecognized status as a passthrough string rather than crashing — render it as-is with neutral (muted) styling.

### 2. Screens

**a. Dashboard** — add one count card to the existing priority row: **`طلبات استشارة بانتظار التنسيق`** (purple/accent, matching the consult-tag color semantics already used for consultation needs). Deep-links to the list. It is **not** the hero CTA — the yellow hero stays whatever it currently is.

**b. `/consult-requests`** — list screen, reusing the existing table/stacked-card pattern.

Per row: patient file number (bold, primary) · patient name · consultation type as an icon + Arabic label badge · notes (truncated) · request date · status badge · action.
Controls: filter by status and consultation type; search by file number; sort by newest.
Action: **`تنسيق الاستشارة`** → confirm dialog → `PATCH .../coordinate` → status becomes `تم التنسيق`, green toast, undo window consistent with the app's other writes.
States: loading skeleton, empty (`لا توجد طلبات استشارة بانتظار التنسيق ✅` in green), error with retry.

**c. Patient record** — add a section (or a tab, matching the existing pattern) showing that patient's consult requests, plus their `consultationNeeds` as badges. Same coordinate action available inline.

### 3. Consultation-type presentation

Icon + Arabic label, never colour alone (existing accessibility rule). Reuse the icon mapping from the Reception app if a shared component exists; otherwise create `src/components/consult-type-badge.tsx` and use it in all three places.

| type | Arabic |
|---|---|
| `cardiac` | قلبية |
| `neurological` | عصبية |
| `ophthalmic` | عينية |
| `ent` | أذنية |
| `surgery` | جراحة |
| `other` | أخرى |

### 4. Arabic strings → `src/i18n/ar.ts`

```
طلبات الاستشارة · استشارات بانتظار التنسيق · نوع الاستشارة · ملاحظات الطلب
تنسيق الاستشارة · تم التنسيق · بانتظار التنسيق · تاريخ الطلب
```

### Part 2 acceptance

1. Dashboard shows a live pending-consult count that deep-links to the list.
2. The list renders with filters, search, and all three states.
3. Coordinating a request moves it to `تم التنسيق` with confirm + toast.
4. The patient record shows that patient's consult requests and consultation-need badges.
5. **No create/delete affordance anywhere** — the doctor reads and coordinates only.
6. Build clean.

---

# PART 3 — Dose approval: adopt the backend's two-step model ★ safety-critical

Do this part last, and read it fully before writing code.

## The problem

This frontend models dose approval as a boolean on the medication order:

```ts
interface MedicationOrder {
  approvalStatus: 'pending' | 'approved';
  administrationStatus: 'scheduled' | 'ready' | 'administered' | 'missed';
  …
}
```

That conflates two different clinical artifacts owned by two different people — the doctor's approval decision, and the nurse's administration item — into one row. It also leaves **lab-before-dose as a client-side convention**: nothing in the data model records *which* lab result justified the dose.

## The backend's model (verified — and better)

```http
POST  /dose-approvals
      { "patient_file_no": "B-1001", "lab_test_request_id": 12 }
      → 201 { "id": …, … }

PATCH /dose-approvals/{id}/approve
      { "approved_dose": "Vincristine 1.5 mg/m²", "route": "IV" }
      → 200 { …, "mar_item_id": … }
```

And, on the results side:

```http
PATCH /lab-test-requests/{id}/review
```

Read what this design guarantees:

- **A dose approval cannot exist without a lab test request.** `lab_test_request_id` is required at creation. Lab-before-dose is enforced by the server, not by frontend discipline.
- **The approval is a durable record of which lab justified which dose** — auditable after the fact.
- **A MAR item only comes into existence as the product of an approved dose approval.** So for the nurse, *existence means approved.* The `approvalStatus` boolean is not just redundant — keeping it invites the two fields to disagree.

## The fix

### 1. Domain types

Add to `src/types/schema.ts`:

```ts
export interface DoseApproval {
  id: string;
  patientFileNo: string;
  labTestRequestId: string;        // REQUIRED — the lab-before-dose gate
  status: 'prepared' | 'approved'; // TODO(api-contract): confirm exact values
  approvedDose?: string;           // set at the approve step
  route?: string;                  // set at the approve step
  marItemId?: string;              // returned by the approve call
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}
```

Then change the MAR item:

```ts
// was MedicationOrder — the backend calls this resource `mar-items`
export interface MarItem {
  id: string;
  patientFileNo: string;
  doseApprovalId?: string;         // NEW — provenance link
  medName: string;
  dose: string;
  route: string;
  scheduledTime: string;
  administrationStatus: 'scheduled' | 'ready' | 'administered' | 'missed';
  // approvalStatus REMOVED — existence implies approved
}
```

Rename `MedicationOrder` → `MarItem` and remove `approvalStatus`. Keep a deprecated type alias only if removing it would break unrelated files you cannot safely touch in this task; if you add one, mark it `@deprecated` with a one-line reason.

### 2. ★ Shared-contract propagation — flag it, don't silently diverge

`src/types/schema.ts` is a **shared contract copied across all six apps** (Doctor, Nurse, Reception, Admin, Lab, Guardian). Two changes in this task affect other apps:

- `Department`: `dayCare` → `daycare`
- `MedicationOrder` → `MarItem`, minus `approvalStatus` — **the Nurse app reads this type directly.**

Update the header comment in `schema.ts` to record both changes and their date, and list them in your final report as required follow-up work on the Nurse app. Do **not** attempt to edit the other apps from this repo.

### 3. Rework the dose-approval screen

Replace the current approve-toggle with a two-step guided flow, reusing the app's existing stepper component.

**Step 1 — تحضير الإقرار (prepare)**

The doctor picks the lab test request that justifies this dose.

- Show only that patient's lab requests that are **reviewed and have a result available**. A request that has not been reviewed does not appear.
- Each option shows: test type(s), result date, and a link to open the result PDF — so the decision is made against the actual result, not a row in a list.
- The selector is **mandatory and has no bypass.** No "skip", no "approve without lab", no default selection. If the patient has no eligible lab request, render an empty state explaining what is needed (`لا يوجد تحليل مُراجَع لهذا المريض — راجع نتيجة تحليل أولاً`) with a link to the results screen. **Do not render a disabled approve button as the only feedback** — say why.
- On continue → `POST /dose-approvals { patient_file_no, lab_test_request_id }`.

**Step 2 — إقرار الجرعة (approve)**

- Displays, as read-only context: patient file number + name, the selected test type and result date, and the treatment stage if available. The doctor must be able to see *who* and *against which result* without navigating away.
- Captures: `approved_dose` (text) and `route`.
- Confirmation dialog before the write, restating patient + dose + route.
- On confirm → `PATCH /dose-approvals/{id}/approve`.

**After approval**

- Status → `تم الإقرار`; green toast; the returned `mar_item_id` is stored on the `DoseApproval`.
- Show that the dose is now ready for the nurse (`جاهزة للإعطاء من الممرضة`).

### 4. Safety rules for this screen — non-negotiable

- **No optimistic UI on the approve call.** Do not render "approved" before the server confirms. If the request fails, the doctor must see failure, not a state that silently rolls back. A dose the doctor believes is approved but is not — or the reverse — is exactly the failure this whole chain exists to prevent.
- **Idempotence:** disable the confirm button while in flight and guard against double-submit. Two approvals from one double-click means two MAR items and a possible double dose.
- **No delete.** A wrong approval is corrected by a new record, never by removing one.
- Errors surface as readable Arabic inline on the step — not a bare toast the doctor may miss.

### 5. Review action on the results screen

Add **`مراجعة النتيجة`** on the lab result / lab request detail → `PATCH /lab-test-requests/{id}/review` → the request becomes eligible in Step 1. Confirm + toast, consistent with the app's other writes. This closes the chain: draw → result → **review** → approve → administer.

### 6. Arabic strings → `src/i18n/ar.ts`

```
إقرار الجرعة · تحضير الإقرار · اختر التحليل المُراجَع · الجرعة المُقرّة · طريق الإعطاء
مراجعة النتيجة · تمت المراجعة · تم الإقرار · جاهزة للإعطاء من الممرضة
لا يوجد تحليل مُراجَع لهذا المريض
```

### Part 3 acceptance

1. `DoseApproval` exists with a **required** `labTestRequestId`; `MarItem` no longer carries `approvalStatus`.
2. Approving a dose is impossible without first selecting a reviewed lab request — there is no code path around it.
3. Step 2 displays patient and lab-result context on screen at the moment of approval.
4. The approve call is non-optimistic, double-submit-guarded, and confirmed by dialog.
5. `مراجعة النتيجة` exists on the results screen and gates eligibility in Step 1.
6. No delete action on approvals; corrections are new records.
7. Mock data covers: a patient with a reviewed result (approvable), a patient with an unreviewed result (must show the explanatory empty state), and an already-approved dose with a `marItemId`.
8. Build clean; design system, RTL, and responsiveness untouched.

---

# Final report

When all three parts are done, print:

1. Files created / modified / renamed, grouped by part.
2. Confirmation that `grep -r "dayCare" src/` is empty.
3. Every place a `TODO(api-contract)` was left, and what needs confirming at each.
4. **The shared-contract changes requiring follow-up in the Nurse app**, stated explicitly.
5. Anything you found that contradicts this prompt — if the codebase disagrees with an assumption here, say so rather than forcing the change.
