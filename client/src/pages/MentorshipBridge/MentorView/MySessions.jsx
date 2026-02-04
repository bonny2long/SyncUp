import React, { useState } from "react";
import {
  updateSessionStatus,
  rescheduleSession,
  deleteSession,
} from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { Calendar, Target, User, Clock } from "lucide-react";
import SkillSelectModal from "../shared/SkillSelectModal";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import RescheduleModal from "../../../components/shared/RescheduleModal";

export default function MySessions({ sessions, loading, error, onRefresh }) {
  const { addToast } = useToast();
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionToAction, setSessionToAction] = useState(null);

  const handleComplete = (sessionId, sessionFocus) => {
    const isTechnical = ["project_support", "technical_guidance"].includes(
      sessionFocus,
    );

    if (isTechnical) {
      setSelectedSessionId(sessionId);
      setShowSkillModal(true);
    } else {
      completeSession(sessionId, []);
    }
  };

  const completeSession = async (sessionId, skillIds) => {
    try {
      await updateSessionStatus(sessionId, {
        status: "completed",
        skill_ids: skillIds,
      });
      addToast({
        type: "success",
        message: skillIds.length > 0 ?
          "Session completed! Intern earned 3x skill signals"
        : "Session completed!",
      });
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to complete session" });
    }
  };

  const handleCompleteWithSkills = (skillIds) => {
    if (selectedSessionId) {
      completeSession(selectedSessionId, skillIds);
    }
    setShowSkillModal(false);
    setSelectedSessionId(null);
  };

  const handleReschedule = (session) => {
    setSessionToAction(session);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async (newDateTime) => {
    if (!sessionToAction) return;

    setActionLoading(true);
    try {
      await rescheduleSession(sessionToAction.id, newDateTime);
      addToast({ type: "success", message: "Session rescheduled successfully" });
      setShowRescheduleModal(false);
      setSessionToAction(null);
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to reschedule session" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = (session) => {
    setSessionToAction(session);
    setShowConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!sessionToAction) return;

    setActionLoading(true);
    try {
      await deleteSession(sessionToAction.id);
      addToast({ type: "info", message: "Session cancelled successfully" });
      setShowConfirmModal(false);
      setSessionToAction(null);
      onRefresh();
    } catch (err) {
      addToast({ type: "error", message: "Failed to cancel session" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading sessions...</p>
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
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No upcoming sessions
        </h3>
        <p className="text-sm text-gray-600">
          Accepted session requests will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Upcoming Sessions ({sessions.length})
        </h2>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onComplete={handleComplete}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />
        ))}
      </div>

      {/* Skill Selection Modal */}
      <SkillSelectModal
        isOpen={showSkillModal}
        onClose={() => {
          setShowSkillModal(false);
          setSelectedSessionId(null);
        }}
        onConfirm={handleCompleteWithSkills}
      />

      {/* Confirm Modal for Cancellation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSessionToAction(null);
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Session?"
        message="Are you sure you want to cancel this mentorship session? This action cannot be undone."
        confirmText="Cancel Session"
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

function SessionCard({ session, onComplete, onReschedule, onCancel }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "No date set";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatFocus = (focus) => {
    if (!focus) return "";
    return focus
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isTechnical = ["project_support", "technical_guidance"].includes(
    session.session_focus,
  );
  const isUpcoming = new Date(session.session_date) > new Date();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {session.topic}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Accepted
            </span>
            {isUpcoming && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Upcoming
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Intern Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
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
      </div>

      {/* Session Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-primary" />
          {formatDate(session.session_date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Target className="w-4 h-4 text-secondary" />
          {formatFocus(session.session_focus)}
          {isTechnical && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Technical (3x signals)
            </span>
          )}
        </div>
      </div>

      {session.details && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700">{session.details}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onComplete(session.id, session.session_focus)}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition font-medium"
        >
          Mark Complete{isTechnical ? " + Skills" : ""}
        </button>
        <button
          onClick={() => onReschedule(session)}
          className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition"
        >
          Reschedule
        </button>
        <button
          onClick={() => onCancel(session)}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
