import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingTour from "./components/shared/OnboardingTour";

// Lazy-loaded pages — each becomes its own chunk
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ProjectPortfolio = React.lazy(() => import("./pages/ProjectPortfolio"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Chat = React.lazy(() => import("./pages/Chat/Chat"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
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
            <Route
              path="/"
              element={<Navigate to="/collaboration" replace />}
            />
            <Route
              path="/collaboration"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorship"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute requireIntern={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <ProjectPortfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </OnboardingProvider>
    </ToastProvider>
  );
}
