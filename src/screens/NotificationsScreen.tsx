import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCheck, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SegmentedControl } from "@/components/ui/segmented";
import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { timeSince } from "@/lib/utils";
import { notificationTypeLabel, t } from "@/i18n/ar";
import type { NotificationType } from "@/mock/types";

type Filter = "all" | "unread" | NotificationType;

const ICON: Record<NotificationType, { node: React.ReactNode; cls: string }> = {
  alert: { node: <AlertTriangle />, cls: "bg-destructive/10 text-destructive" },
  reminder: { node: <Bell />, cls: "bg-highlight-soft text-highlight-foreground" },
  info: { node: <Info />, cls: "bg-primary-soft text-primary" },
};

export function NotificationsScreen() {
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const patients = useAppStore((s) => s.patients);
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    let rows = [...notifications];
    if (filter === "unread") rows = rows.filter((n) => !n.isRead);
    else if (filter !== "all") rows = rows.filter((n) => n.type === filter);
    return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [notifications, filter]);

  const patientName = (fileNo?: string) => {
    if (!fileNo) return "";
    const p = patients.find((x) => x.fileNoBasma === fileNo);
    return p ? `${p.firstName} ${p.familyName}` : fileNo;
  };

  return (
    <div>
      <PageHeader
        title={t.notifications.title}
        action={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="size-4" /> {t.notifications.markAllRead}
          </Button>
        }
      />

      <div className="mb-5">
        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t.common.all },
            { value: "unread", label: t.notifications.unread },
            { value: "alert", label: notificationTypeLabel.alert },
            { value: "reminder", label: notificationTypeLabel.reminder },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState title={t.notifications.empty} />
      ) : (
        <div className="space-y-3">
          {list.map((n) => {
            const icon = ICON[n.type];
            return (
              <Card
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`cursor-pointer transition hover:shadow-md ${!n.isRead ? "border-primary/40 bg-primary-soft/20" : ""}`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${icon.cls}`}>
                    {icon.node}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">{notificationTypeLabel[n.type]}</Badge>
                      <span className="text-xs text-muted-foreground">{timeSince(n.timestamp)}</span>
                    </div>
                    <p className="mt-1 leading-snug">{n.message}</p>
                    {n.relatedPatientFileNo && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3.5" />
                        <span className="font-mono">{n.relatedPatientFileNo}</span> · {patientName(n.relatedPatientFileNo)}
                      </p>
                    )}
                  </div>
                  {!n.isRead && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
