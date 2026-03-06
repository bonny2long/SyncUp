import React from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Maintenance() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "We are doing some work on the app. Please check back soon.";
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Under Maintenance
          </h1>
          <p className="text-text-secondary">{message}</p>
        </div>

        {isAdmin && (
          <div className="bg-surface-highlight/30 rounded-lg p-4 text-left">
            <p className="text-sm text-text-secondary mb-2">
              <span className="font-medium text-primary">Admin Access:</span> You can still access the platform because you're logged in as an admin.
            </p>
            <a
              href="/admin"
              className="inline-block text-sm text-accent hover:underline"
            >
              Go to Admin Dashboard →
            </a>
          </div>
        )}

        {!isAdmin && user && (
          <div className="mt-4">
            <p className="text-sm text-text-secondary mb-3">
              Logged in as {user.name}. Want to switch accounts?
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              Log Out
            </button>
          </div>
        )}

        {!user && (
          <div className="mt-4">
            <a
              href="/login"
              className="inline-block px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm"
            >
              Go to Login
            </a>
          </div>
        )}

        {!isAdmin && !user && (
          <p className="text-sm text-text-secondary mt-4">
            We'll be back soon!
          </p>
        )}
      </div>
    </div>
  );
}
