import React, { Suspense, useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingTour from "./components/shared/OnboardingTour";
import { API_BASE } from "./utils/api";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ProjectPortfolio = React.lazy(() => import("./pages/ProjectPortfolio"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Chat = React.lazy(() => import("./pages/Chat/Chat"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Maintenance = React.lazy(() => import("./pages/Maintenance"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
}

function MaintenanceCheck({ children }) {
  const { user, loading } = useUser();
  const [maintenanceMode, setMaintenanceMode] = useState(null);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch(`${API_BASE}/admin/settings/maintenance`);
        if (res.ok) {
          const data = await res.json();
          setMaintenanceMode(data.enabled);
        }
      } catch {
        setMaintenanceMode(false);
      }
    }
    checkMaintenance();
  }, []);

  if (loading || maintenanceMode === null) return null;

  if (maintenanceMode && (!user || user.role !== "admin")) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
}

function ProtectedRoute({
  children,
  requireIntern = false,
  requireAdmin = false,
}) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === "admin";

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireIntern && user.role !== "intern" && user.role !== "admin")
    return <Navigate to="/collaboration" replace />;

  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <OnboardingProvider>
        <OnboardingTour />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route
              path="/"
              element={
                <MaintenanceCheck>
                  <Navigate to="/collaboration" replace />
                </MaintenanceCheck>
              }
            />
            <Route
              path="/collaboration"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/chat"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/mentorship"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/skills"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute requireIntern={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/portfolio"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <ProjectPortfolio />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/settings"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/admin"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </OnboardingProvider>
    </ToastProvider>
  );
}
