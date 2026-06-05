import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FlaskConical,
  HeartPulse,
  Syringe,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  labStatusLabel,
  lifeStatusLabel,
  queueStatusLabel,
  stageStatusLabel,
} from "@/i18n/ar";
import type { LabRequestStatus, LifeStatus, PatientQueueStatus, StageStatus } from "@/mock/types";

/** Queue status → token variant + icon (color + icon + label, never color alone). */
const QUEUE_MAP: Record<PatientQueueStatus, { variant: BadgeProps["variant"]; icon: React.ReactNode }> = {
  "awaiting-lab": { variant: "warning", icon: <FlaskConical /> },
  "result-ready": { variant: "primary", icon: <CheckCircle2 /> },
  "awaiting-dose-approval": { variant: "highlight", icon: <Syringe /> },
  "in-treatment": { variant: "secondary", icon: <Activity /> },
  completed: { variant: "muted", icon: <CheckCircle2 /> },
  critical: { variant: "destructive", icon: <AlertTriangle /> },
};

export function QueueStatusBadge({ status }: { status: PatientQueueStatus }) {
  const m = QUEUE_MAP[status];
  return (
    <Badge variant={m.variant}>
      {m.icon}
      {queueStatusLabel[status]}
    </Badge>
  );
}

const LIFE_MAP: Record<LifeStatus, { variant: BadgeProps["variant"]; icon: React.ReactNode }> = {
  alive: { variant: "secondary", icon: <HeartPulse /> },
  deceased: { variant: "muted", icon: <Clock /> },
  discontinued: { variant: "warning", icon: <AlertTriangle /> },
  lost: { variant: "warning", icon: <AlertTriangle /> },
  unknown: { variant: "muted", icon: <Clock /> },
};

export function LifeStatusBadge({ status }: { status: LifeStatus }) {
  const m = LIFE_MAP[status];
  return (
    <Badge variant={m.variant}>
      {m.icon}
      {lifeStatusLabel[status]}
    </Badge>
  );
}

const LAB_MAP: Record<LabRequestStatus, BadgeProps["variant"]> = {
  pending: "warning",
  accepted: "primary",
  rejected: "destructive",
  "results-available": "secondary",
};

export function LabStatusBadge({ status }: { status: LabRequestStatus }) {
  return <Badge variant={LAB_MAP[status]}>{labStatusLabel[status]}</Badge>;
}

const STAGE_MAP: Record<StageStatus, BadgeProps["variant"]> = {
  "in-progress": "primary",
  completed: "secondary",
  pending: "muted",
};

export function StageStatusBadge({ status }: { status: StageStatus }) {
  return <Badge variant={STAGE_MAP[status]}>{stageStatusLabel[status]}</Badge>;
}
