import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/api/auth.api";
import type { AuthUser } from "@/mock/types";

/** `admin` is deliberately allowed — the association manager is also a treating doctor. */
export const ALLOWED_DOCTOR_APP_ROLES = ["doctor", "admin"] as const;

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,

      setSession: (user, token) => set({ user, token, isAuthenticated: true }),

      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),

      bootstrap: async () => {
        const token = get().token;
        if (!token) {
          set({ isBootstrapping: false });
          return;
        }
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isBootstrapping: false });
        } catch {
          // Sanctum has no refresh token: a token that fails to resolve here is
          // revoked or invalid, not "expired" — clear it silently and land on /login.
          set({ user: null, token: null, isAuthenticated: false, isBootstrapping: false });
        }
      },
    }),
    {
      name: "basma.doctor.token",
      partialize: (s) => ({ token: s.token }),
    }
  )
);

/** Gate feature-screen actions on the live permission list — see AuthUser.permissions. */
export function can(user: AuthUser | null, permission: string): boolean {
  return Boolean(user?.permissions.includes(permission));
}
