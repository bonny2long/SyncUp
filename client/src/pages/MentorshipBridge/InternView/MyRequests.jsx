import React, { useState } from "react";
import { rescheduleSession, deleteSession } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { useUser } from "../../../context/UserContext";
import { Calendar, Clock, Target, XCircle, Users, ArrowRight } from "lucide-react";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import RescheduleModal from "../../../components/shared/RescheduleModal";

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
    } catch (err) {
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
    } catch (err) {
      addToast({ type: "error", message: "Failed to reschedule session" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-text-secondary">Loading your requests...</p>
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

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Pending Requests
          {pending.length > 0 && (
            <span className="text-sm font-normal text-text-secondary">
              ({pending.length})
            </span>
          )}
        </h2>
        {pending.length === 0 ?
          <div className="bg-surface-highlight border border-dashed border-border rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-sm text-text-secondary mb-3">
              No pending requests. Find a mentor to get started!
            </p>
            {onFindMentors && (
              <button
                onClick={onFindMentors}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Find a Mentor
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
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
      <section>
        <h2 className="text-lg font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Upcoming Sessions
          {accepted.length > 0 && (
            <span className="text-sm font-normal text-text-secondary">
              ({accepted.length})
            </span>
          )}
        </h2>
        {accepted.length === 0 ?
          <div className="bg-surface-highlight border border-dashed border-border rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-text-secondary mb-3">
              No upcoming sessions scheduled
            </p>
            {onFindMentors && (
              <button
                onClick={onFindMentors}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Book Your First Session
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        : <div className="space-y-3">
            {accepted.map((session) => (
              <RequestCard
                key={session.id}
                session={session}
                type="accepted"
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        }
      </section>

      {/* Declined Requests */}
      {declined.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-neutral-dark mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
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
    <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-dark">{session.topic}</h3>
          <p className="text-sm text-text-secondary mt-1">
            With:{" "}
            <span className="font-medium text-primary">
              {session.mentor_name}
            </span>
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
            type === "pending" ? "bg-yellow-100 text-yellow-700"
            : type === "accepted" ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
          }`}
        >
          {type}
        </span>
      </div>

      <div className="text-sm text-text-secondary space-y-1 mb-3">
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(session.session_date)}
        </p>
        <p className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Focus:{" "}
          <span className="font-medium">
            {formatFocus(session.session_focus)}
          </span>
        </p>
        <p className="text-xs text-text-secondary">
          Requested {formatTimeAgo(session.created_at)}
        </p>
      </div>

      {session.details && (
        <p className="text-sm text-text-secondary bg-surface-highlight p-2 rounded mb-3">
          {session.details}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {type === "pending" && (
          <button
            onClick={() => onCancel(session)}
            className="text-sm px-4 py-2 rounded-lg bg-surface-highlight text-text-secondary hover:bg-border transition"
          >
            Cancel Request
          </button>
        )}

        {type === "accepted" && (
          <>
            <button
              onClick={() => onReschedule(session)}
              className="text-sm px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition font-medium"
            >
              Reschedule
            </button>
            <button
              onClick={() => onCancel(session)}
              className="text-sm px-4 py-2 rounded-lg bg-surface-highlight text-text-secondary hover:bg-border transition"
            >
              Cancel
            </button>
          </>
        )}

        {type === "declined" && (
          <p className="text-sm text-red-600">
            This mentor declined your request. You can request again from the
            Find Mentors tab.
          </p>
        )}
      </div>
    </div>
  );
}
