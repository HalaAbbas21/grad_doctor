import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import { useAppStore } from "@/store/useAppStore";
import { AppShell } from "@/app/AppShell";
import { LoginScreen } from "@/screens/LoginScreen";
import { DepartmentSelectScreen } from "@/screens/DepartmentSelectScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { PatientsScreen } from "@/screens/PatientsScreen";
import { PatientRecordScreen } from "@/screens/PatientRecordScreen";
import { DocumentationScreen } from "@/screens/DocumentationScreen";
import { LabRequestScreen } from "@/screens/LabRequestScreen";
import { ResultsScreen } from "@/screens/ResultsScreen";
import { DoseApprovalScreen } from "@/screens/DoseApprovalScreen";
import { TreatmentPlanScreen } from "@/screens/TreatmentPlanScreen";
import { DischargeScreen } from "@/screens/DischargeScreen";
import { LabsScreen } from "@/screens/LabsScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authenticated = useAppStore((s) => s.authenticated);
  const location = useLocation();
  if (!authenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/select-department" element={<DepartmentSelectScreen />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/patients" element={<PatientsScreen />} />
          <Route path="/patients/:fileNo" element={<PatientRecordScreen />} />
          <Route path="/patients/:fileNo/document" element={<DocumentationScreen />} />
          <Route path="/patients/:fileNo/lab-request" element={<LabRequestScreen />} />
          <Route path="/patients/:fileNo/results" element={<ResultsScreen />} />
          <Route path="/patients/:fileNo/dose" element={<DoseApprovalScreen />} />
          <Route path="/patients/:fileNo/plan" element={<TreatmentPlanScreen />} />
          <Route path="/patients/:fileNo/discharge" element={<DischargeScreen />} />
          <Route path="/labs" element={<LabsScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
