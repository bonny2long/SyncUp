import React, { useState } from "react";
import { updateSessionStatus, deleteSession } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { Calendar, Target, User, Mail, Clock } from "lucide-react";
import ConfirmModal from "../../../components/shared/ConfirmModal";

export default function IncomingRequests({
  sessions,
  loading,
  error,
  onRefresh,
}) {
  const { addToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionToDecline, setSessionToDecline] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAccept = async (sessionId) => {
    try {
      await updateSessionStatus(sessionId, { status: "accepted" });
      addToast({ type: "success", message: "Session accepted! ✅" });
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to accept session" });
    }
  };

  const handleDecline = (session) => {
    setSessionToDecline(session);
    setShowConfirmModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!sessionToDecline) return;

    setActionLoading(true);
    try {
      await updateSessionStatus(sessionToDecline.id, { status: "declined" });
      addToast({ type: "info", message: "Session request declined" });
      setShowConfirmModal(false);
      setSessionToDecline(null);
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to decline session request" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No pending requests
        </h3>
        <p className="text-sm text-gray-600">
          You're all caught up! New session requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Requests ({sessions.length})
        </h2>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <RequestCard
            key={session.id}
            session={session}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}
      </div>

      {/* Confirm Modal for Declining */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSessionToDecline(null);
        }}
        onConfirm={handleDeclineConfirm}
        title="Decline Session Request?"
        message={`Are you sure you want to decline the session request from ${sessionToDecline?.intern_name || 'this intern'}? This action cannot be undone.`}
        confirmText="Decline Request"
        confirmColor="red"
        loading={actionLoading}
        icon="alert"
      />
    </div>
  );
}

function RequestCard({ session, onAccept, onDecline }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "No date set";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const formatFocus = (focus) => {
    if (!focus) return "";
    return focus
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white border-2 border-yellow-200 rounded-lg p-4 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {session.topic}
          </h3>
          <p className="text-xs text-yellow-600 mt-1">
            Requested {formatTimeAgo(session.created_at)}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
          New Request
        </span>
      </div>

      {/* Intern Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {session.intern_name}
          </span>
          {session.intern_role && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
              {session.intern_role}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-500" />
          {session.intern_email}
        </div>
      </div>

      {/* Session Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">Preferred Time:</span>
          {formatDate(session.session_date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Target className="w-4 h-4 text-secondary" />
          <span className="font-medium">Focus:</span>
          {formatFocus(session.session_focus)}
        </div>
      </div>

      {session.details && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-blue-900 mb-1">Details:</p>
          <p className="text-sm text-blue-800">{session.details}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onAccept(session.id)}
          className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium"
        >
          Accept Session
        </button>
        <button
          onClick={() => onDecline(session)}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
