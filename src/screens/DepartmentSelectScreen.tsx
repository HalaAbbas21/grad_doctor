import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Building2, ChevronLeft, Stethoscope, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { useQueues } from "@/hooks/useQueues";
import { t } from "@/i18n/ar";
import type { Department } from "@/constants/departments";

const OPTIONS: {
  key: Department;
  title: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
}[] = [
  { key: "clinic", title: t.departments.clinic, desc: t.departments.clinicDesc, icon: <Stethoscope />, gradient: "bg-hope" },
  { key: "daycare", title: t.departments.daycare, desc: t.departments.daycareDesc, icon: <Sun />, gradient: "bg-sun" },
  { key: "inpatient", title: t.departments.inpatient, desc: t.departments.inpatientDesc, icon: <Building2 />, gradient: "bg-care" },
];

export function DepartmentSelectScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDepartment } = useAppStore();

  // TODO(api-contract): confirm the exact "waiting" status value — only
  // "served" has been observed on GET /queues so far. If the real waiting
  // value turns out different, this is the one line to change.
  const WAITING_STATUS = "waiting";

  const clinicQueue = useQueues("clinic");
  const daycareQueue = useQueues("daycare");
  const inpatientQueue = useQueues("inpatient");
  const queueByDept: Record<Department, ReturnType<typeof useQueues>> = {
    clinic: clinicQueue,
    daycare: daycareQueue,
    inpatient: inpatientQueue,
  };

  /** Patients currently waiting (not served/etc.) — null on load/error, so the card falls back to "—" without blocking selection. */
  const count = (d: Department): number | null => {
    const q = queueByDept[d];
    if (q.isLoading || q.isError) return null;
    return q.items.filter((i) => i.status === WAITING_STATUS).length;
  };

  const choose = (d: Department) => {
    setDepartment(d);
    // `from` is only ever set by LoginScreen relaying a genuine pre-auth deep
    // link (e.g. /patients/B-1042) — see its `state.from` handling.
    // ProtectedRoute's "no department chosen" redirect deliberately does not
    // set it, so an incidental route (e.g. reloading on /profile) never gets
    // mistaken for one; the fallback below sends that case to the dashboard.
    const from = (location.state as { from?: Location } | null)?.from;
    navigate(from ? `${from.pathname}${from.search}` : "/", { replace: true });
  };

  return (
    <div className="surface-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">{t.departments.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.departments.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {OPTIONS.map((o) => (
            <button key={o.key} onClick={() => choose(o.key)} className="text-right focus-visible:outline-none">
              <Card className="group h-full overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                <div className={`flex h-24 items-center justify-center ${o.gradient} text-white [&_svg]:size-10`}>
                  {o.icon}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{o.title}</h2>
                    <ChevronLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                    {count(o.key) ?? "—"} {t.departments.patientsToday}
                  </p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
