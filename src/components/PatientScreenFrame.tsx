import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientContextBar } from "@/components/PatientContextBar";
import { PageHeader } from "@/components/PageHeader";
import { usePatient } from "@/hooks/usePatient";
import { t } from "@/i18n/ar";
import type { Patient } from "@/mock/types";

interface PatientScreenFrameProps {
  title: string;
  subtitle?: string;
  children: (patient: Patient) => React.ReactNode;
}

/** Wraps a patient-scoped screen with the sticky context bar + loading/not-found/error guards, backed by the real GET /patients/{fileNo}. */
export function PatientScreenFrame({ title, subtitle, children }: PatientScreenFrameProps) {
  const { fileNo = "" } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError, error, refetch } = usePatient(fileNo);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (isError || !patient) {
    if (error?.status === 404) {
      return (
        <div className="py-10">
          <EmptyState title="لم يتم العثور على المريض" description={`رقم الإضبارة: ${fileNo}`} />
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate("/patients")}>
              {t.common.back}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PatientContextBar patient={patient} />
      <PageHeader title={title} subtitle={subtitle} back />
      {children(patient)}
    </div>
  );
}
