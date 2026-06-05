import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  Globe,
  Search,
  Syringe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ListSkeleton } from "@/components/ui/states";
import { CountCard } from "@/components/CountCard";
import { PatientRow } from "@/components/PatientRow";
import { useAppStore } from "@/store/useAppStore";
import { useDashboardCounts, useDepartmentQueue } from "@/store/selectors";
import { useMockLoad } from "@/hooks/useMockLoad";
import { formatDate, timeSince } from "@/lib/utils";
import {
  appointmentStatusLabel,
  appointmentTypeLabel,
  departmentLabel,
  notificationTypeLabel,
  t,
} from "@/i18n/ar";

export function DashboardScreen() {
  const navigate = useNavigate();
  const { doctor, department, appointments, notifications, patients } = useAppStore();
  const counts = useDashboardCounts();
  const queue = useDepartmentQueue();
  const { loading } = useMockLoad([department]);

  const today = formatDate(new Date().toISOString());
  const deptAppts = appointments.filter(
    (a) => patients.find((p) => p.fileNoBasma === a.patientFileNo)?.department === department
  );
  const recentNotifs = notifications.slice(0, 4);

  const patientName = (fileNo: string) => {
    const p = patients.find((x) => x.fileNoBasma === fileNo);
    return p ? `${p.firstName} ${p.familyName}` : fileNo;
  };

  return (
    <div className="space-y-6">
      {/* 1. Greeting strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.dashboard.greeting} {doctor.firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {doctor.specialization} · {t.dashboard.activeDepartment}:{" "}
            <button onClick={() => navigate("/profile")} className="font-bold text-primary hover:underline">
              {departmentLabel[department]}
            </button>{" "}
            · {today}
          </p>
        </div>
      </div>

      {/* 2. Prominent file-number search */}
      <button
        onClick={() => navigate("/patients")}
        className="flex h-14 w-full items-center gap-3 rounded-2xl border border-input bg-card px-5 text-base text-muted-foreground shadow-sm transition hover:border-primary/50"
      >
        <Search className="size-5 text-primary" />
        {t.common.searchByFileNo}
      </button>

      {/* 3. Priority row */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">{t.dashboard.priorityTitle}</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <CountCard
              label={t.dashboard.resultsToReview}
              count={counts.resultsToReview}
              tone="primary"
              icon={<FlaskConical />}
              onClick={() => navigate("/labs")}
            />
            <CountCard
              label={t.dashboard.dosesToApprove}
              count={counts.dosesToApprove}
              tone="highlight"
              hero
              icon={<Syringe />}
              onClick={() => navigate("/patients?filter=awaiting-dose-approval")}
            />
            <CountCard
              label={t.dashboard.incompleteDrafts}
              count={counts.incompleteDrafts}
              tone="accent"
              icon={<ClipboardList />}
              onClick={() => navigate("/patients?filter=drafts")}
            />
            <CountCard
              label={t.dashboard.pendingDischarge}
              count={counts.pendingDischarge}
              tone="primary"
              icon={<FileCheck2 />}
              onClick={() => navigate("/patients?filter=discharge")}
            />
            <CountCard
              label={t.dashboard.newExternalResults}
              count={counts.newExternalResults}
              tone="secondary"
              icon={<Globe />}
              onClick={() => navigate("/labs?filter=external-new")}
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 4. Today's queue */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {t.dashboard.todayQueue} · {departmentLabel[department]}
            </h2>
            <Button variant="link" size="sm" onClick={() => navigate("/patients")}>
              {t.dashboard.viewAll}
            </Button>
          </div>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : queue.length === 0 ? (
            <EmptyState tone="success" title={t.dashboard.allClear} />
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 6).map((p) => (
                <PatientRow key={p.fileNoBasma} patient={p} />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          {/* 5. Today's appointments */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">{t.dashboard.todayAppointments}</h2>
            <Card>
              <CardContent className="p-2">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : deptAppts.length === 0 ? (
                  <EmptyState title="لا مواعيد اليوم" />
                ) : (
                  <ul className="divide-y divide-border">
                    {deptAppts.map((a) => (
                      <li
                        key={a.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-muted"
                        onClick={() => navigate(`/patients/${a.patientFileNo}`)}
                      >
                        <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <CalendarClock className="size-4" />
                          <span className="text-[10px] font-bold">
                            {new Date(a.dateTime).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{patientName(a.patientFileNo)}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-mono">{a.patientFileNo}</span> · {appointmentTypeLabel[a.type]}
                          </p>
                        </div>
                        <Badge variant="muted">{appointmentStatusLabel[a.status]}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 6. Notifications feed */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t.dashboard.notificationsFeed}</h2>
              <Button variant="link" size="sm" onClick={() => navigate("/notifications")}>
                {t.dashboard.viewAll}
              </Button>
            </div>
            <Card>
              <CardContent className="p-2">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentNotifs.map((n) => (
                      <li
                        key={n.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition hover:bg-muted"
                        onClick={() => navigate(n.link ?? "/notifications")}
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                          <Bell className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">{n.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notificationTypeLabel[n.type]} · {timeSince(n.timestamp)}
                          </p>
                        </div>
                        {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
