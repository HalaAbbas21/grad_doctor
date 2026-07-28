import { useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Fingerprint, KeyRound, Loader2, Lock, Mail, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as authApi from "@/api/auth.api";
import type { ApiError } from "@/api/errors";
import { ALLOWED_DOCTOR_APP_ROLES, useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/i18n/ar";

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const lockedOut = attempts >= 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedOut || loading) return;
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { user, token } = await authApi.login(email, password);

      if (!ALLOWED_DOCTOR_APP_ROLES.includes(user.role as (typeof ALLOWED_DOCTOR_APP_ROLES)[number])) {
        setLoading(false);
        setAttempts((a) => a + 1);
        setError(t.login.notDoctorAccount);
        return;
      }

      setSession(user, token);

      // A fresh login is a shift-selection moment, clinically: a doctor may
      // work Clinic in the morning and Inpatient in the afternoon, so it must
      // never silently reuse a persisted department. This forces
      // /select-department to appear regardless of what's in localStorage —
      // only a page *reload* (bootstrap(), not this login flow) may skip it.
      useAppStore.getState().requireDepartmentSelection();
      setLoading(false);

      // Still forward a genuine deep-link target (e.g. /patients/B-1042) so
      // DepartmentSelectScreen can complete that trip after the pick. The
      // default "/" landing doesn't count as one: since "/" is itself a
      // protected route, every ordinary unauthenticated visit produces a
      // `from` of "/" too, and that's not a destination worth restoring.
      const from = (location.state as { from?: Location } | null)?.from;
      const isDeepLink = Boolean(from && from.pathname !== "/");
      navigate("/select-department", { replace: true, state: isDeepLink ? { from } : undefined });
    } catch (err) {
      setLoading(false);
      setAttempts((a) => a + 1);
      setError((err as ApiError).message ?? "تعذّر تسجيل الدخول.");
    }
  };

  return (
    <div className="surface-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hero (Brand gradient, used sparingly) */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-brand text-white shadow-lg">
            <Stethoscope className="size-8" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{t.appName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-bold">{t.login.title}</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.login.email}</Label>
                <div className="relative">
                  <Mail className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pe-10"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.login.password}</Label>
                <div className="relative">
                  <Lock className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pe-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {lockedOut ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                  {t.login.lockout}
                </p>
              ) : (
                error && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                    {error}
                  </p>
                )
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading || lockedOut}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : null}
                {t.login.signIn}
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" disabled>
                  <Fingerprint className="size-5" />
                  {t.login.biometric}
                </Button>
                <Button type="button" variant="outline" className="flex-1" disabled>
                  <KeyRound className="size-5" />
                  {t.login.pin}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">{t.login.hint}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
