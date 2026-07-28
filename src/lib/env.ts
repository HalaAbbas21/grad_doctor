/** Typed access to build-time env vars — the only place `import.meta.env` should be read. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
};
