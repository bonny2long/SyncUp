import React, { useState } from "react";
import {
  updateSessionStatus,
  rescheduleSession,
  deleteSession,
} from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { Calendar, CheckCircle, Clock, Target, User } from "lucide-react";
import SkillSelectModal from "../shared/SkillSelectModal";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import RescheduleModal from "../../../components/shared/RescheduleModal";
import SessionChat from "../shared/SessionChat";
import EmptyState from "../../../components/brand/EmptyState";

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
        message:
          skillIds.length > 0 ?
            "Session completed! Intern earned 3x skill signals"
          : "Session completed!",
      });
      onRefresh();
    } catch {
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
    } catch {
      addToast({ type: "error", message: "Failed to cancel session" });
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
        icon={Calendar}
        title="No upcoming sessions"
        message="Your accepted mentorship sessions will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="brand-card flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Mentorship Calendar</p>
          <h2 className="text-lg font-black text-neutral-dark">
            Upcoming Sessions ({sessions.length})
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id}>
            <SessionCard
              session={session}
              onComplete={handleComplete}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
            />
            <SessionChat
              otherUser={{
                id: session.intern_id,
                name: session.intern_name,
                role: "intern",
              }}
            />
          </div>
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
    <div className="brand-card brand-card-hover overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-neutral-dark">
            {session.topic}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
              <CheckCircle className="h-3 w-3" />
              Accepted
            </span>
            {isUpcoming && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Upcoming
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Intern Info */}
      <div className="m-4 rounded-xl bg-surface-highlight p-3">
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
      </div>

      {/* Session Details */}
      <div className="mx-4 mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar className="w-4 h-4 text-primary" />
          {formatDate(session.session_date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Target className="w-4 h-4 text-primary" />
          {formatFocus(session.session_focus)}
          {isTechnical && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              Technical (3x signals)
            </span>
          )}
        </div>
      </div>

      {session.details && (
        <div className="mx-4 mb-3 rounded-xl bg-surface-highlight p-3">
          <p className="text-sm text-text-secondary">{session.details}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-border p-4">
        <button
          onClick={() => onComplete(session.id, session.session_focus)}
          className="rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary/90"
        >
          Mark Complete{isTechnical ? " + Skills" : ""}
        </button>
        <button
          onClick={() => onReschedule(session)}
          className="rounded-lg bg-primary/10 px-4 py-2 font-bold text-primary transition hover:bg-primary/20"
        >
          Reschedule
        </button>
        <button
          onClick={() => onCancel(session)}
          className="rounded-lg bg-surface-highlight px-4 py-2 font-bold text-text-secondary transition hover:bg-border"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
