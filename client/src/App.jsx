import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingTour from "./components/shared/OnboardingTour";
import ProjectPortfolio from "./pages/ProjectPortfolio";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat/Chat";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, requireIntern = false, requireAdmin = false }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  const isAdmin = user.role === 'admin';
  
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
        <Routes>
        <Route path="/" element={<Navigate to="/collaboration" replace />} />
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
      </OnboardingProvider>
    </ToastProvider>
  );
}
