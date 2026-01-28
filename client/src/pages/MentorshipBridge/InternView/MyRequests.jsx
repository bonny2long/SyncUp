import React from "react";
import { rescheduleSession, deleteSession } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { Calendar, Clock, Target, XCircle } from "lucide-react";

export default function MyRequests({
  pending,
  accepted,
  declined,
  loading,
  error,
  onRefresh,
}) {
  const { addToast } = useToast();

  const handleCancel = async (sessionId) => {
    if (!window.confirm("Cancel this session request?")) return;

    try {
      await deleteSession(sessionId);
      addToast({ type: "success", message: "Request cancelled" });
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to cancel request" });
    }
  };

  const handleReschedule = async (sessionId) => {
    const newDate = prompt("Enter new date/time (YYYY-MM-DDTHH:MM):");
    if (!newDate) return;

    try {
      await rescheduleSession(sessionId, newDate);
      addToast({ type: "success", message: "Session rescheduled" });
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to reschedule" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading your requests...</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Pending Requests
          {pending.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({pending.length})
            </span>
          )}
        </h2>
        {pending.length === 0 ?
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            No pending requests. Find a mentor to get started!
          </p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Upcoming Sessions
          {accepted.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({accepted.length})
            </span>
          )}
        </h2>
        {accepted.length === 0 ?
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            No upcoming sessions scheduled
          </p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{session.topic}</h3>
          <p className="text-sm text-gray-600 mt-1">
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

      <div className="text-sm text-gray-600 space-y-1 mb-3">
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
        <p className="text-xs text-gray-500">
          Requested {formatTimeAgo(session.created_at)}
        </p>
      </div>

      {session.details && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
          {session.details}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {type === "pending" && (
          <button
            onClick={() => onCancel(session.id)}
            className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel Request
          </button>
        )}

        {type === "accepted" && (
          <>
            <button
              onClick={() => onReschedule(session.id)}
              className="text-sm px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition font-medium"
            >
              Reschedule
            </button>
            <button
              onClick={() => onCancel(session.id)}
              className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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
