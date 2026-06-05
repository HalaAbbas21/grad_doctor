import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, KeyRound, Loader2, Lock, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { delay } from "@/lib/utils";
import { t } from "@/i18n/ar";

export function LoginScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("dr.layla");
  const [password, setPassword] = useState("••••••");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const lockedOut = attempts >= 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedOut) return;
    if (!username || !password) {
      setAttempts((a) => a + 1);
      toast.error("بيانات غير مكتملة", "يرجى إدخال اسم المستخدم وكلمة المرور.");
      return;
    }
    setLoading(true);
    await delay(700);
    setLoading(false);
    navigate("/select-department");
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
                <Label htmlFor="username">{t.login.username}</Label>
                <div className="relative">
                  <User className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pe-10"
                    autoComplete="username"
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

              {lockedOut && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                  {t.login.lockout}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading || lockedOut}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : null}
                {t.login.signIn}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/select-department")}
                >
                  <Fingerprint className="size-5" />
                  {t.login.biometric}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/select-department")}
                >
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
