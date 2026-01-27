import React, { useState } from "react";
import { createJoinRequest } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errorHandler";

export default function JoinProjectModal({
  project,
  onConfirm,
  onCancel,
  onRequestSent,
}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!project) return null;

  const handleSubmitRequest = async () => {
    setLoading(true);
    try {
      // Import currentUser from context
      const { user: currentUser } =
        await import("../../context/UserContext").then((m) => ({ user: null }));

      // Get user ID - need to pass it differently
      // Will be called with onRequestSent callback
      await onConfirm();
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast({
        type: "error",
        message: message || "Failed to submit request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <h2 className="text-2xl font-bold text-neutralDark mb-2">
          Request to Join?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Your request will be sent to the project owner for approval. You'll be
          notified once they review it.
        </p>

        {/* Project Info */}
        <div className="bg-neutralLight rounded-lg p-4 mb-6 space-y-4">
          {/* Title */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
              Project
            </p>
            <h3 className="text-lg font-bold text-neutralDark">
              {project.title}
            </h3>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                About
              </p>
              <p className="text-sm text-gray-700">{project.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                Team Size
              </p>
              <p className="text-2xl font-bold text-primary">
                {project.team_count ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                Skills
              </p>
              <p className="text-2xl font-bold text-accent">
                {project.skill_count ?? 0}
              </p>
            </div>
          </div>

          {/* Team Members */}
          {project.team_member_details &&
            project.team_member_details.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                  Current Team
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.team_member_details.slice(0, 4).map((member) => (
                    <span
                      key={member.id}
                      className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-700"
                    >
                      {member.name}
                    </span>
                  ))}
                  {project.team_member_details.length > 4 && (
                    <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-700">
                      +{project.team_member_details.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-neutralDark rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ?
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
