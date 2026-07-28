import axios from "axios";
import { env } from "@/lib/env";
import { toApiError } from "./errors";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiError = toApiError(err);
    const isLoginRequest = typeof err?.config?.url === "string" && err.config.url.includes("/auth/login");

    // No refresh token on this backend: a 401 means revoked/invalid, never "expired, refresh it".
    // Skip the login call itself — otherwise a wrong password clears state and the
    // login screen blinks instead of showing an error message.
    // Clearing the session flips `isAuthenticated`, which ProtectedRoute reacts to
    // and redirects from — no manual navigation needed here.
    if (apiError.status === 401 && !isLoginRequest) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(apiError);
  }
);
