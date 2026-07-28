import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/useAppStore";

/**
 * Gates the authenticated route group on the real (Sanctum) session — the
 * single source of truth for "is the user authenticated" is `auth.store`.
 * Renders a full-page loader while `bootstrap()` is still resolving so a
 * logged-in user reloading the page never sees a login-screen flash.
 *
 * Also requires a chosen department (`useAppStore.departmentChosen`, restored
 * from localStorage when valid): every feature screen depends on it, so an
 * authenticated session without one is sent to /select-department. This
 * redirect deliberately does NOT carry `state.from` — wherever the tab
 * happened to be sitting (e.g. /profile after a reload) isn't a deep link the
 * user was trying to reach, so after picking a department they land on the
 * dashboard, not back on an incidental route. Genuine deep links are relayed
 * separately, via the `!isAuthenticated` branch below → LoginScreen →
 * DepartmentSelectScreen.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const departmentChosen = useAppStore((s) => s.departmentChosen);
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="surface-bg flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!departmentChosen) {
    return <Navigate to="/select-department" replace />;
  }

  return <>{children}</>;
}
