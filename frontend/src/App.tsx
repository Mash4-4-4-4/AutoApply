import { Navigate, Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import { useMe } from "./lib/auth";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Roles from "./pages/Roles";
import ResumeStep from "./pages/ResumeStep";
import Review from "./pages/Review";
import Dashboard from "./pages/Dashboard";

/** Where a signed-in user should land based on onboarding progress. */
const home = (step: number) => (step <= 2 ? "/onboarding/roles" : step === 3 ? "/onboarding/resume" : step === 4 ? "/onboarding/review" : "/home");

function Private({ children, minStep = 0, maxStep = 99 }: { children: ReactNode; minStep?: number; maxStep?: number }) {
  const { data: me, isLoading } = useMe();
  if (isLoading) return null;
  if (!me) return <Navigate to="/" replace />;
  if (me.onboardingStep < minStep || me.onboardingStep > maxStep) return <Navigate to={home(me.onboardingStep)} replace />;
  return <>{children}</>;
}

function Public({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useMe();
  if (isLoading) return null;
  return me ? <Navigate to={home(me.onboardingStep)} replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Public><Welcome /></Public>} />
      <Route path="/signup" element={<Public><Signup /></Public>} />
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/onboarding/roles" element={<Private maxStep={4}><Roles /></Private>} />
      <Route path="/onboarding/resume" element={<Private minStep={3} maxStep={4}><ResumeStep /></Private>} />
      <Route path="/onboarding/review" element={<Private minStep={4} maxStep={4}><Review /></Private>} />
      <Route path="/home" element={<Private minStep={5}><Dashboard /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
