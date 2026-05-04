import React, { Suspense, useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingTour from "./components/shared/OnboardingTour";
import ErrorBoundary from "./components/ErrorBoundary";
import { API_BASE } from "./utils/api";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ProjectPortfolio = React.lazy(() => import("./pages/ProjectPortfolio"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Chat = React.lazy(() => import("./pages/Chat/Chat"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Maintenance = React.lazy(() => import("./pages/Maintenance"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
}

function HomeRedirect() {
  const { user, loading } = useUser();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  // Everyone goes to collaboration on login.
  // Admins reach their dashboard via the sidebar.
  return <Navigate to="/collaboration" replace />;
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

  if (maintenanceMode && (!user || !user.is_admin)) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
}

function ProtectedRoute({
  children,
  requireIntern = false,
  requireAdmin = false,
  disallowAdmin = false,
  requireChatAccess = false,
  requireCommunityMember = false,
}) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.is_admin === true;
  const isCommunityMember = ["alumni", "resident"].includes(
    user.role,
  );
  const canAccessSyncChat =
    isCommunityMember || (user.role === "intern" && user.has_commenced);

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  // disallowAdmin only blocks admins from intern-only spaces (lobby, skills)
  if (disallowAdmin && isAdmin) return <Navigate to="/collaboration" replace />;
  if (requireIntern && user.role !== "intern")
    return <Navigate to="/collaboration" replace />;
  // Admins can access chat and community pages — they are community members
  if (requireChatAccess && !canAccessSyncChat && !isAdmin)
    return <Navigate to="/mentorship" replace />;
  if (requireCommunityMember && !isCommunityMember && !isAdmin)
    return <Navigate to="/collaboration" replace />;

  return children;
}

export default function App() {
  return (
      <ToastProvider>
        <OnboardingProvider>
          <OnboardingTour />
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route
              path="/"
              element={
                <MaintenanceCheck>
                  <HomeRedirect />
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
                  <ProtectedRoute requireChatAccess={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/lobby"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute
                    disallowAdmin={true}
                    requireIntern={true}
                  >
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
              path="/directory"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute requireCommunityMember={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/opportunities"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute requireCommunityMember={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </MaintenanceCheck>
              }
            />
            <Route
              path="/skills"
              element={
                <MaintenanceCheck>
                  <ProtectedRoute requireIntern={true} disallowAdmin={true}>
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
            <Route
              path="/p/:userId"
              element={
                <MaintenanceCheck>
                  <UserProfile isPublic={true} />
                </MaintenanceCheck>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
          </ErrorBoundary>
        </OnboardingProvider>
      </ToastProvider>
  );
}
