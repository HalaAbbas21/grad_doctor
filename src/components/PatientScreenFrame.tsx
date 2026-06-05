import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { PatientContextBar } from "@/components/PatientContextBar";
import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/i18n/ar";
import type { Patient } from "@/mock/types";

interface PatientScreenFrameProps {
  title: string;
  subtitle?: string;
  children: (patient: Patient) => React.ReactNode;
}

/** Wraps a patient-scoped screen with the sticky context bar + not-found guard. */
export function PatientScreenFrame({ title, subtitle, children }: PatientScreenFrameProps) {
  const { fileNo = "" } = useParams();
  const navigate = useNavigate();
  const patient = useAppStore((s) => s.patients.find((p) => p.fileNoBasma === fileNo));

  if (!patient) {
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
    <div>
      <PatientContextBar patient={patient} />
      <PageHeader title={title} subtitle={subtitle} back />
      {children(patient)}
    </div>
  );
}
