import React, { useState } from "react";
import { updateSessionStatus } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { Calendar, Check, Clock, Mail, Target, User, X } from "lucide-react";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import EmptyState from "../../../components/brand/EmptyState";

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
      addToast({ type: "success", message: "Session accepted!" });
      onRefresh();
    } catch {
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
    } catch {
      addToast({ type: "error", message: "Failed to decline session request" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="brand-card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-card border-red-200 p-4">
        <p className="font-semibold text-red-700">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-2 text-sm font-bold text-red-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No pending requests"
        message="New mentorship requests will appear here when interns ask for support."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="brand-card flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Mentorship Queue</p>
          <h2 className="text-lg font-black text-neutral-dark">
            Pending Requests ({sessions.length})
          </h2>
        </div>
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
        message={`Are you sure you want to decline the session request from ${sessionToDecline?.intern_name || "this intern"}? This action cannot be undone.`}
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
    <div className="brand-card brand-card-hover overflow-hidden border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-neutral-dark">
            {session.topic}
          </h3>
          <p className="mt-1 text-xs font-semibold text-primary">
            Requested {formatTimeAgo(session.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">
          New Request
        </span>
      </div>

      {/* Intern Info */}
      <div className="m-4 space-y-2 rounded-xl bg-surface-highlight p-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-text-secondary" />
          <span className="font-black text-neutral-dark">
            {session.intern_name}
          </span>
          {session.intern_role && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {session.intern_role}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Mail className="w-4 h-4 text-text-secondary" />
          {session.intern_email}
        </div>
      </div>

      {/* Session Details */}
      <div className="mx-4 mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">Preferred Time:</span>
          {formatDate(session.session_date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-medium">Focus:</span>
          {formatFocus(session.session_focus)}
        </div>
      </div>

      {session.details && (
        <div className="mx-4 mb-3 rounded-xl border border-border bg-surface-highlight p-3">
          <p className="mb-1 text-xs font-black uppercase text-primary">Details</p>
          <p className="text-sm text-neutral-dark">{session.details}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-border p-4">
        <button
          onClick={() => onAccept(session.id)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary/90"
        >
          <Check className="h-4 w-4" />
          Accept Session
        </button>
        <button
          onClick={() => onDecline(session)}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-highlight px-4 py-2 font-bold text-text-secondary transition hover:bg-border"
        >
          <X className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
}
