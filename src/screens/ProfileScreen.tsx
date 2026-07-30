import { useNavigate } from "react-router-dom";
import { Fingerprint, LogOut, Mail, Phone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useToast } from "@/components/ui/toast";
import * as authApi from "@/api/auth.api";
import { DEPARTMENTS, type Department } from "@/constants/departments";
import { departmentLabel, t } from "@/i18n/ar";

const ROLE_LABEL_AR: Record<string, string> = { doctor: "طبيب", admin: "مدير" };

function Row({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      {loading ? <Skeleton className="h-4 w-24" /> : <span className="font-semibold text-foreground">{value}</span>}
    </div>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const { department, setDepartment } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.profile.title} />

      <Card className="mb-5">
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-16 text-xl">
            <AvatarFallback>{user?.firstName?.charAt(0) ?? "—"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">د. {user?.fullName ?? "—"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
            <Badge variant="primary" className="mt-1.5">
              {(user && ROLE_LABEL_AR[user.role]) ?? user?.role ?? "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base">{t.profile.contact}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row
            label={t.profile.specialization}
            value={profile?.specialization ?? "—"}
            loading={profileLoading}
          />
          <Separator />
          <Row
            label={t.profile.professionalId}
            value={profile?.professionalId ?? "—"}
            loading={profileLoading}
          />
          <Separator />
          <Row label="البريد الإلكتروني" value={user?.email ?? "—"} icon={<Mail className="size-4" />} />
          <Separator />
          <Row
            label="الهاتف"
            value={profile?.contactPhone ?? "—"}
            icon={<Phone className="size-4" />}
            loading={profileLoading}
          />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base">{t.departments.switch}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={department}
            onValueChange={(v) => {
              setDepartment(v as Department);
              toast.success(t.common.saved, `${t.dashboard.activeDepartment}: ${departmentLabel[v as Department]}`);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {departmentLabel[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base">{t.profile.securitySettings}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" /> {t.profile.securityNote}
          </p>
          <Button variant="outline" size="sm" disabled>
            <Fingerprint className="size-4" /> {t.login.biometric}
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={async () => {
          await authApi.logout();
          clearSession();
          navigate("/login");
        }}
      >
        <LogOut className="size-5" /> {t.common.logout}
      </Button>
    </div>
  );
}
