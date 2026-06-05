import { useNavigate } from "react-router-dom";
import { Fingerprint, LogOut, Mail, Phone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/toast";
import { departmentLabel, professionalStatusLabel, t } from "@/i18n/ar";
import type { Department } from "@/mock/types";

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const { doctor, department, setDepartment, logout } = useAppStore();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.profile.title} />

      <Card className="mb-5">
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-16 text-xl">
            <AvatarFallback>{doctor.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">
              د. {doctor.firstName} {doctor.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            <Badge variant="primary" className="mt-1.5">
              {professionalStatusLabel[doctor.professionalStatus]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base">{t.profile.contact}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label={t.profile.specialization} value={doctor.specialization} />
          <Separator />
          <Row label={t.profile.professionalId} value={doctor.professionalId} />
          <Separator />
          <Row label="البريد الإلكتروني" value={doctor.contactEmail} icon={<Mail className="size-4" />} />
          <Separator />
          <Row label="الهاتف" value={doctor.contactPhone} icon={<Phone className="size-4" />} />
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
              <SelectItem value="clinic">{departmentLabel.clinic}</SelectItem>
              <SelectItem value="daycare">{departmentLabel.daycare}</SelectItem>
              <SelectItem value="inpatient">{departmentLabel.inpatient}</SelectItem>
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
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        <LogOut className="size-5" /> {t.common.logout}
      </Button>
    </div>
  );
}
