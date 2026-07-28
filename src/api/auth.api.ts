import { apiClient } from "./client";
import { mapUser } from "./mappers/user.mapper";
import type { RawLoginResponse, RawUser } from "./types/raw";
import type { AuthUser } from "@/mock/types";

/**
 * TODO(api-contract): /auth/me shape unverified — accepts a bare user object
 * or one wrapped in `{ data: … }` / `{ user: … }` and unwraps recursively.
 */
function extractRawUser(body: unknown): RawUser | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  if (typeof obj.email === "string" && "id" in obj) return obj as unknown as RawUser;
  if (obj.data && typeof obj.data === "object") return extractRawUser(obj.data);
  if (obj.user && typeof obj.user === "object") return extractRawUser(obj.user);
  return null;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const res = await apiClient.post<RawLoginResponse>("/auth/login", { email, password });
  return { user: mapUser(res.data.user), token: res.data.token };
}

export async function me(): Promise<AuthUser> {
  const res = await apiClient.get("/auth/me");
  const raw = extractRawUser(res.data);
  if (!raw) {
    console.warn("[auth] Unexpected /auth/me response shape:", res.data);
    throw new Error("Unexpected /auth/me response shape");
  }
  return mapUser(raw);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // A user who clicks logout must end up logged out locally no matter what
    // the network does — the caller clears the local session unconditionally.
  }
}
