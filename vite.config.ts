import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Fallback for when the backend doesn't allow this origin's CORS request —
    // set VITE_API_BASE_URL=/api to route through this proxy instead of the direct URL.
    proxy: {
      "/api": { target: "http://api.basma-unit.cloud:8080", changeOrigin: true },
    },
  },
});
