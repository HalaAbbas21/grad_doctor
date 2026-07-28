import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  FlaskConical,
  Globe,
  Hourglass,
  PhoneCall,
  Search,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { CountCard } from "@/components/CountCard";
import { useAppStore } from "@/store/useAppStore";
import { useDashboardCounts } from "@/store/selectors";
import { useMockLoad } from "@/hooks/useMockLoad";
import { useAppointments } from "@/hooks/useAppointments";
import { useQueues } from "@/hooks/useQueues";
import { cn, damascusDateKey, formatDate, formatTime, timeSince } from "@/lib/utils";
import {
  appointmentStatusLabel,
  appointmentTypeLabel,
  departmentLabel,
  notificationTypeLabel,
  queueItemStatusLabel,
  t,
} from "@/i18n/ar";

const QUEUE_STATUS_ICON: Record<string, React.ReactNode> = {
  served: <CheckCircle2 className="size-3.5" />,
  waiting: <Hourglass className="size-3.5" />,
  called: <PhoneCall className="size-3.5" />,
};

const QUEUE_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  served: "muted",
  waiting: "warning",
  called: "primary",
};

export function DashboardScreen() {
  const navigate = useNavigate();
  const { doctor, department, notifications } = useAppStore();
  const counts = useDashboardCounts();
  const { loading } = useMockLoad([department]);
  const {
    items: todayAppointments,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    refetch: refetchAppointments,
  } = useAppointments({ department });
  const {
    items: queueItems,
    isLoading: queueLoading,
    isError: queueError,
    refetch: refetchQueue,
  } = useQueues(department);

  const today = formatDate(new Date().toISOString());
  const todayKey = damascusDateKey(new Date().toISOString());
  // "Today" is client-side against Asia/Damascus — no date/today filter param is confirmed for GET /queues.
  // TODO(api-contract): confirm a date/today filter param exists server-side.
  const todayQueue = queueItems.filter((q) => q.queueDate === todayKey);
  const recentNotifs = notifications.slice(0, 4);

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
            <CountCard
              label={t.dashboard.pendingConsults}
              count={counts.pendingConsults}
              tone="accent"
              icon={<Stethoscope />}
              onClick={() => navigate("/consult-requests")}
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
          {queueLoading ? (
            <ListSkeleton rows={4} />
          ) : queueError ? (
            <ErrorState onRetry={() => refetchQueue()} />
          ) : todayQueue.length === 0 ? (
            <EmptyState tone="success" title={t.dashboard.allClear} />
          ) : (
            <div className="space-y-3">
              {todayQueue.slice(0, 6).map((q) => (
                <Card
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/patients/${q.patientFileNo}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/patients/${q.patientFileNo}`)}
                  className="flex cursor-pointer items-center gap-3 p-3.5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-center leading-none">
                    <span className="text-[9px] text-muted-foreground">{t.common.token}</span>
                    <span className="text-base font-bold text-foreground">{q.number}</span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" className="font-mono">
                        <FileText className="size-3.5" />
                        {q.patientFileNo}
                      </Badge>
                      <span className="font-bold text-foreground">{q.patientName}</span>
                    </div>
                    {q.isEmergency && (
                      <p className="mt-1">
                        <Badge variant="warning">
                          <AlertTriangle className="size-3.5" />
                          طارئ
                        </Badge>
                      </p>
                    )}
                  </div>

                  <Badge variant={QUEUE_STATUS_VARIANT[q.status] ?? "outline"}>
                    {QUEUE_STATUS_ICON[q.status]}
                    {queueItemStatusLabel[q.status] ?? q.status}
                  </Badge>
                </Card>
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
                {appointmentsLoading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : appointmentsError ? (
                  <ErrorState onRetry={() => refetchAppointments()} />
                ) : todayAppointments.length === 0 ? (
                  <EmptyState title="لا مواعيد اليوم" />
                ) : (
                  <ul className="divide-y divide-border">
                    {todayAppointments.map((a) => {
                      const cancelled = a.status === "cancelled";
                      return (
                        <li
                          key={a.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-muted"
                          onClick={() => navigate(`/patients/${a.patientFileNo}`)}
                        >
                          <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <CalendarClock className="size-4" />
                            <span className="text-[10px] font-bold">{formatTime(a.scheduledAt)}</span>
                          </span>
                          <div className={cn("min-w-0 flex-1", cancelled && "opacity-60")}>
                            <p className={cn("truncate font-bold", cancelled && "line-through")}>
                              {a.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-mono">{a.patientFileNo}</span> ·{" "}
                              {appointmentTypeLabel[a.type] ?? a.type}
                            </p>
                          </div>
                          <Badge variant={cancelled ? "destructive" : "muted"}>
                            {appointmentStatusLabel[a.status] ?? a.status}
                          </Badge>
                        </li>
                      );
                    })}
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
