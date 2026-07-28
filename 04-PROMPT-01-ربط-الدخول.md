

You are connecting this React + Vite + TypeScript app to its real backend for the first time. Scope: **the authentication layer and the login screen only.** No feature screen is migrated in this task.

## 0. Guardrails

- **Do not touch** the design system (tokens, Tajawal/Nunito/Quicksand, gradients, radii, Surface background), RTL Arabic, or the responsive layouts.
- **Do not modify or delete** anything under `src/mock/` except where explicitly stated. All feature screens keep running on mock data after this task.
- **Do not refactor** unrelated code. This work is additive.
- `tsconfig` stays strict. `npm run build` must pass with zero type errors.
- Reuse the app's existing components (buttons, inputs, cards, toasts, skeletons). Introduce no new visual pattern.

## 1. Known facts about this codebase

Do not re-derive these; they were established in a previous session:

- The shared contract file is **`src/mock/types.ts`** — there is no `src/types/schema.ts`.
- State management is **Zustand**, in `src/store/useAppStore.ts` with selectors in `src/store/selectors.ts`.
- The app currently has **no persistence layer at all** — no `localStorage`, no `zustand/persist`. You are introducing the first one.
- Routes are defined in `src/App.tsx`; the shell is `src/app/AppShell.tsx`.
- Arabic strings live in `src/i18n/ar.ts`.

Find the existing login screen. If one exists, wire it — **do not redesign it**. If none exists, build one using the app's existing form components and the Hope or Care gradient, matching the visual language of the other screens.

## 2. ★ Verified backend contract

Everything in this section is confirmed against the live server. Do not invent anything beyond it.

```
Base URL: http://api.basma-unit.cloud:8080/api
Protocol: HTTP (not HTTPS), port 8080
Auth:     Laravel Sanctum — Bearer token, no refresh token
Casing:   backend is snake_case; this app's domain types are camelCase
```

### Login

```http
POST /auth/login
Accept: application/json
Content-Type: application/json

{ "email": "rana@basma.org", "password": "password" }
```

Response `200` — **exact shape, verified:**

```json
{
  "user": {
    "id": 2,
    "first_name": "رنا",
    "last_name": "الطبيب",
    "full_name": "رنا الطبيب",
    "email": "rana@basma.org",
    "role": "doctor",
    "status": "active",
    "permissions": [
      "patients.oversee",
      "patients.edit",
      "labs.requestTest",
      "labs.readResults",
      "notes.write"
    ]
  },
  "token": "28|VNTZz5jSND2BgalVc6q23Cx1E6MhemVNdC1XcMZOd157adc7"
}
```

Note: `user` and `token` are **both at the root** — there is no `data` envelope on this endpoint. `user.id` is a **number**. `full_name` is provided by the server; use it rather than concatenating names.

### Other auth endpoints

```http
GET  /auth/me       → shape NOT yet verified. Probably the user object,
                       possibly wrapped. Handle both; see §5.
POST /auth/logout   → revokes the token server-side
```

Both require `Authorization: Bearer <token>`.

### Sanctum implications — these drive real requirements

- **No refresh token.** The token stays valid until revoked. A 401 therefore means *revoked or invalid*, not *expired, please refresh* — so on 401 the only correct action is to clear the session and return to login.
- **`POST /auth/logout` must actually be called on logout.** Clearing the token locally alone leaves it valid on the server indefinitely.

## 3. The architectural rule that makes the rest of the migration cheap

> **snake_case must never escape `src/api/`.**

Raw backend shapes are typed in `src/api/types/raw.ts` and converted by mappers in `src/api/mappers/`. Everything outside `src/api/` — screens, stores, components — sees only camelCase domain types.

This is what will let each later slice be migrated independently, and what stops a backend field rename from rippling through the UI. Hold this line strictly even though right now it only covers one entity.

## 4. Files to create

```
.env.example                      committed
.env.local                        gitignored — create it, and add it to .gitignore
src/lib/env.ts                    typed env access
src/api/client.ts                 axios instance + interceptors
src/api/errors.ts                 normalized ApiError
src/api/types/raw.ts              raw snake_case DTOs
src/api/mappers/user.mapper.ts    RawUser → AuthUser
src/api/auth.api.ts               login / me / logout
src/store/auth.store.ts           session state, persisted
src/app/guards/ProtectedRoute.tsx route guard
```

## 5. Implementation

### `.env.example` / `.env.local`

```
VITE_API_BASE_URL=http://api.basma-unit.cloud:8080/api
VITE_USE_MOCK=true
```

`VITE_USE_MOCK` stays `true` — feature screens keep reading mock data. Auth goes live regardless of the flag.

### Domain type — add to `src/mock/types.ts`

```ts
export interface AuthUser {
  id: string;              // backend sends a number — stringify at the mapper
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;            // 'doctor' | 'admin' | … — keep open, see below
  status: string;          // 'active' | 'inactive' | …
  permissions: string[];   // deliberately NOT a closed union — see below
}
```

**Why `permissions: string[]` and not a union:** the live response contains `patients.edit`, which does not appear in the project's documented permission list. The backend clearly holds more keys than are written down. A closed union would break the build the day someone adds a permission — a build failure caused by a *server* change, in a file nobody touched. Keep it open and gate behavior through a helper:

```ts
export function can(user: AuthUser | null, permission: string): boolean
```

Put `can()` where the store lives. Later slices will use it to show/hide actions.

### `src/api/errors.ts`

```ts
export interface ApiError {
  status: number;                          // 0 = network failure / timeout
  message: string;                         // Arabic, safe to display
  fieldErrors?: Record<string, string[]>;  // from 422
  raw?: unknown;
}

export function toApiError(err: unknown): ApiError
```

Arabic defaults:

| status | message |
|---|---|
| 0 | `تعذّر الاتصال بالخادم` |
| 401 | `انتهت الجلسة، سجّل الدخول مجدداً` |
| 403 | `لا تملك صلاحية لهذا الإجراء` |
| 404 | `العنصر المطلوب غير موجود` |
| 422 | server `message` if present, else `تحقق من البيانات المُدخلة` |
| 5xx | `خطأ في الخادم، حاول لاحقاً` |

The 422 body shape is **not yet verified**. Assume Laravel's `{ message, errors: { field: [msg] } }` but parse defensively: if `errors` is missing or malformed fall back to `message`, and if that's missing use the generic string. `toApiError` must never itself throw — it is the last line of defense.

Mark the 422 assumption `// TODO(api-contract): 422 shape unverified`.

### `src/api/client.ts`

Add `axios` if not already present. One instance:

- `baseURL` from env, `Accept: application/json`, `timeout: 20000`.
- **Request interceptor:** attach `Authorization: Bearer <token>` when a token exists in the auth store.
- **Response interceptor:** on error, `reject(toApiError(err))`. On **401**: clear the session and redirect to `/login` — **except** when the failing request is the login call itself. Without that exception, a wrong password triggers a redirect instead of an error message, and the user sees the login page blink with no explanation.

### `src/api/types/raw.ts`

```ts
export interface RawUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  permissions: string[];
}

export interface RawLoginResponse {
  user: RawUser;
  token: string;
}
```

### `src/api/mappers/user.mapper.ts`

`mapUser(raw: RawUser): AuthUser` — stringify `id`, camelCase the rest, default `permissions` to `[]` if absent.

### `src/api/auth.api.ts`

```ts
login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
me(): Promise<AuthUser>
logout(): Promise<void>
```

- `login` maps the response through `mapUser`.
- `me` — the response shape is unverified. Accept **either** a bare user object **or** one wrapped in `{ data: … }` / `{ user: … }`, then map. Log a `console.warn` on an unexpected shape rather than throwing, and mark it `// TODO(api-contract): /auth/me shape unverified`.
- `logout` — call the endpoint, but clear the local session **even if the request fails**. A user who clicks logout must end up logged out locally no matter what the network does.

### `src/store/auth.store.ts`

Zustand, matching the existing store's conventions. State: `token`, `user`, `isAuthenticated`, `isBootstrapping`. Actions: `setSession`, `clearSession`, `bootstrap`.

- Persist **only the token**, to `localStorage` under `basma.doctor.token`. Do not persist the user object — it can go stale (role or permissions revoked server-side); re-fetch it instead.
- `bootstrap()`: on app start, if a token exists, call `me()` to rehydrate the user and confirm the token is still valid. If it fails, clear the session silently and land on `/login`. Set `isBootstrapping` false when done.

### `src/app/guards/ProtectedRoute.tsx`

- While `isBootstrapping` is true, render the app's existing skeleton/loading component. **Do not render the login screen during this window** — a logged-in user reloading the page would see a login flash on every refresh.
- No token → redirect to `/login`, preserving the attempted path so the user returns there after logging in.

Wrap the authenticated routes in `src/App.tsx`. Preserve the app's existing post-login flow — if it currently goes to department selection before the dashboard, keep that.

### Login screen

Wire the existing screen. On submit: `login()` → `setSession()` → navigate. Show `ApiError.message` inline in Arabic on failure, using the app's existing error styling. Disable the submit button while in flight and guard against double-submit.

### ★ Role gate

`/auth/login` accepts **any** role — a nurse or receptionist can obtain a valid token here. If one logs into the Doctor app they land in a UI built for permissions they don't have, and the failures appear later as confusing 403s on random screens instead of one clear message at the door.

After a successful login, if `user.role` is not `doctor` or `admin`, reject the session (clear it, do not navigate) and show:

```
هذا الحساب ليس حساب طبيب
```

`admin` is allowed deliberately: in this system the association manager is also a treating doctor. Put the allowed roles in a named constant so the rule is visible and editable in one place.

## 6. CORS / dev proxy

The backend is plain HTTP on port 8080 and may not allow `http://localhost:5173`.

Add a Vite dev proxy as a fallback:

```ts
// vite.config.ts
server: {
  proxy: {
    "/api": { target: "http://api.basma-unit.cloud:8080", changeOrigin: true },
  },
}
```

This must work with `VITE_API_BASE_URL=/api` as an alternative value. Document both options in the README: try the direct URL first, switch to the proxy if the browser reports a CORS error.

## 7. Acceptance criteria

1. `npm run build` passes, zero type errors, strict mode unchanged.
2. Logging in with a real doctor account reaches the app's normal post-login destination.
3. The session survives a page refresh with **no login flash** during bootstrap.
4. A wrong password shows a readable Arabic message on the login screen — no redirect, no blank screen, no loop.
5. Server unreachable → `تعذّر الاتصال بالخادم`, not a hang or an unhandled crash.
6. A non-doctor/non-admin account is rejected with `هذا الحساب ليس حساب طبيب` and is **not** logged in.
7. Visiting a protected route while logged out redirects to `/login`; after logging in the user lands on the originally requested route.
8. Logout calls `POST /auth/logout`, clears the session, and returns to `/login` — and still logs out locally if the request fails.
9. Every other screen renders exactly as before, still on mock data.
10. No snake_case identifier appears outside `src/api/`.
11. `.env.local` is gitignored; `.env.example` is committed.

## 8. Final report

Print:

1. Files created / modified.
2. Whether the direct URL worked or the dev proxy was required (CORS).
3. **The actual JSON shape returned by `GET /auth/me`** — real observed keys, token redacted. This is still unverified and is needed for the next slice.
4. Whether `@tanstack/react-query` is present in this project (do not install it in this task — just report).
5. Every `TODO(api-contract)` left, and what needs confirming at each.
6. Anything in this prompt that contradicts what you find in the codebase — report it rather than forcing the change.

Do not start any other slice. Stop here.
