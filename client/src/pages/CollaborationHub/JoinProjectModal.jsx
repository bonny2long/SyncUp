import React from "react";

export default function JoinProjectModal({
  project,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <h2 className="text-2xl font-bold text-neutralDark mb-2">
          Join Project?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          You're about to join this project. You'll be able to post updates and
          collaborate with the team.
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
                Joining...
              </>
            : "Yes, Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
