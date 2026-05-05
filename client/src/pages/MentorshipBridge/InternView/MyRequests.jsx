import React, { useState } from "react";
import { rescheduleSession, deleteSession } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { useUser } from "../../../context/UserContext";
import {
  ArrowRight,
  Calendar,
  Clock,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import RescheduleModal from "../../../components/shared/RescheduleModal";
import SessionChat from "../shared/SessionChat";
import EmptyState from "../../../components/brand/EmptyState";

export default function MyRequests({
  pending,
  accepted,
  declined,
  loading,
  error,
  onRefresh,
  onFindMentors,
}) {
  const { addToast } = useToast();
  const { user } = useUser();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [sessionToAction, setSessionToAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancel = (session) => {
    // Authorization check: Ensure this intern owns the session
    if (session.intern_id !== user.id) {
      addToast({
        type: "error",
        message: "You can only cancel your own requests",
      });
      return;
    }
    setSessionToAction(session);
    setShowConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!sessionToAction) return;

    // Double-check authorization
    if (sessionToAction.intern_id !== user.id) {
      addToast({ type: "error", message: "Authorization error" });
      setShowConfirmModal(false);
      setSessionToAction(null);
      return;
    }

    setActionLoading(true);
    try {
      await deleteSession(sessionToAction.id);
      addToast({ type: "success", message: "Request cancelled successfully" });
      setShowConfirmModal(false);
      setSessionToAction(null);
      onRefresh();
    } catch {
      addToast({ type: "error", message: "Failed to cancel request" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = (session) => {
    // Authorization check: Ensure this intern owns the session
    if (session.intern_id !== user.id) {
      addToast({
        type: "error",
        message: "You can only reschedule your own sessions",
      });
      return;
    }
    setSessionToAction(session);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async (newDateTime) => {
    if (!sessionToAction) return;

    // Double-check authorization
    if (sessionToAction.intern_id !== user.id) {
      addToast({ type: "error", message: "Authorization error" });
      setShowRescheduleModal(false);
      setSessionToAction(null);
      return;
    }

    setActionLoading(true);
    try {
      await rescheduleSession(sessionToAction.id, newDateTime);
      addToast({
        type: "success",
        message: "Session rescheduled successfully",
      });
      setShowRescheduleModal(false);
      setSessionToAction(null);
      onRefresh();
    } catch {
      addToast({ type: "error", message: "Failed to reschedule session" });
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
      <div className="brand-card border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
        <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  const totalRequests = pending.length + accepted.length + declined.length;

  return (
    <div className="space-y-5">
      <div className="brand-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              Mentorship Requests
            </p>
            <h2 className="text-xl font-bold text-neutral-dark">
              Your support pipeline
            </h2>
            <p className="text-sm text-text-secondary">
              Track requests, upcoming sessions, and mentor replies in one place.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-border bg-surface-highlight px-4 py-2">
            <p className="text-lg font-bold text-neutral-dark">
              {pending.length}
            </p>
            <p className="text-xs text-text-secondary">Pending</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-highlight px-4 py-2">
            <p className="text-lg font-bold text-primary">
              {accepted.length}
            </p>
            <p className="text-xs text-text-secondary">Upcoming</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-highlight px-4 py-2">
            <p className="text-lg font-bold text-neutral-dark">
              {totalRequests}
            </p>
            <p className="text-xs text-text-secondary">Total</p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <section className="brand-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
          <Clock className="h-5 w-5 text-primary" />
          Pending Requests
          {pending.length > 0 && (
            <span className="text-sm font-normal text-text-secondary">
              ({pending.length})
            </span>
          )}
        </h2>
        {pending.length === 0 ?
          <EmptyState
            icon={Clock}
            title="No pending requests"
            description="Find a mentor when you are ready to ask for project, resume, or career support."
            action={
              onFindMentors && (
                <button
                  onClick={onFindMentors}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Find a Mentor
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            }
          />
        : <div className="space-y-3">
            {pending.map((session) => (
              <RequestCard
                key={session.id}
                session={session}
                type="pending"
                onCancel={handleCancel}
              />
            ))}
          </div>
        }
      </section>

      {/* Upcoming Sessions (Accepted) */}
      <section className="brand-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Sessions
          {accepted.length > 0 && (
            <span className="text-sm font-normal text-text-secondary">
              ({accepted.length})
            </span>
          )}
        </h2>
        {accepted.length === 0 ?
          <EmptyState
            icon={Calendar}
            title="No upcoming sessions"
            description="Accepted sessions will appear here with your session chat."
            action={
              onFindMentors && (
                <button
                  onClick={onFindMentors}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Book Your First Session
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            }
          />
        : <div className="space-y-4">
            {accepted.map((session) => (
              <div
                key={session.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <RequestCard
                  session={session}
                  type="accepted"
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
                <SessionChat
                  otherUser={{
                    id: session.mentor_id,
                    name: session.mentor_name,
                    role: session.mentor_role || "mentor",
                  }}
                />
              </div>
            ))}
          </div>
        }
      </section>

      {/* Declined Requests */}
      {declined.length > 0 && (
        <section className="brand-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
            <XCircle className="h-5 w-5 text-red-600" />
            Declined Requests ({declined.length})
          </h2>
          <div className="space-y-3">
            {declined.map((session) => (
              <RequestCard key={session.id} session={session} type="declined" />
            ))}
          </div>
        </section>
      )}

      {/* Confirm Modal for Cancellation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSessionToAction(null);
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Session Request?"
        message={`Are you sure you want to cancel this session request? This action cannot be undone.`}
        confirmText="Cancel Request"
        confirmColor="red"
        loading={actionLoading}
        icon="alert"
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSessionToAction(null);
        }}
        onConfirm={handleRescheduleConfirm}
        loading={actionLoading}
        currentDateTime={sessionToAction?.session_date || ""}
      />
    </div>
  );
}

// Helper component for individual request cards
function RequestCard({ session, type, onCancel, onReschedule }) {
  const statusConfig = {
    pending: "border-primary/20 bg-primary/10 text-primary",
    accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    declined: "border-red-200 bg-red-50 text-red-700",
  };

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
    <div className="brand-card-hover bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-dark">{session.topic}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            With:{" "}
            <span className="font-medium text-primary">
              {session.mentor_name}
            </span>
          </p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold capitalize ${
            statusConfig[type]
          }`}
        >
          {type}
        </span>
      </div>

      <div className="mb-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {formatDate(session.session_date)}
        </p>
        <p className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Focus:{" "}
          <span className="font-medium">
            {formatFocus(session.session_focus)}
          </span>
        </p>
        <p className="text-xs text-text-secondary sm:col-span-2">
          Requested {formatTimeAgo(session.created_at)}
        </p>
      </div>

      {session.details && (
        <p className="mb-3 rounded-xl border border-border bg-surface-highlight p-3 text-sm text-text-secondary">
          {session.details}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {type === "pending" && (
          <button
            onClick={() => onCancel(session)}
            className="rounded-full border border-border bg-surface-highlight px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
          >
            Cancel Request
          </button>
        )}

        {type === "accepted" && (
          <>
            <button
              onClick={() => onReschedule(session)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Reschedule
            </button>
            <button
              onClick={() => onCancel(session)}
              className="rounded-full border border-border bg-surface-highlight px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
            >
              Cancel
            </button>
          </>
        )}

        {type === "declined" && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            This mentor declined your request. You can request again from the
            Find Mentors tab.
          </p>
        )}
      </div>
    </div>
  );
}
