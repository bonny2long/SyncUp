import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
