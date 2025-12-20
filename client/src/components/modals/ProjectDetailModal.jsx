import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  updateProjectStatus,
  addProjectMember,
  removeProjectMember,
} from "../../utils/api";

export default function ProjectDetailModal({
  project,
  currentUser,
  updates = [],
  onClose,
}) {
  const [localProject, setLocalProject] = useState(project);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const handleStatusChange = async (next) => {
    setStatusLoading(true);
    setError("");
    try {
      setLocalProject((p) => ({ ...p, status: next }));
      await updateProjectStatus(project.id, next);
    } catch (err) {
      setError("Could not update status.");
      setLocalProject(project);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleMembership = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    setError("");

    const isMember =
      localProject.is_member === 1 || localProject.is_member === true;

    try {
      if (isMember) {
        await removeProjectMember(project.id, currentUser.id);
        setLocalProject((p) => ({
          ...p,
          is_member: 0,
          team_count: p.team_count - 1,
          team_members: p.team_members
            .split(", ")
            .filter((n) => n !== currentUser.name)
            .join(", "),
        }));
      } else {
        await addProjectMember(project.id, currentUser.id);
        setLocalProject((p) => ({
          ...p,
          is_member: 1,
          team_count: p.team_count + 1,
          team_members: p.team_members
            ? p.team_members + ", " + currentUser.name
            : currentUser.name,
        }));
      }
    } catch (err) {
      setError("Could not update membership.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["planned", "active", "completed", "archived"];

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl animate-enterModal relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-primary mb-2">
          {localProject.title}
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          {localProject.description}
        </p>

        {/* Status + Join Row */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={localProject.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusLoading}
            className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={handleMembership}
            disabled={loading}
            className={`text-sm px-3 py-1 rounded-lg border transition ${
              localProject.is_member
                ? "border-red-300 text-red-600 hover:bg-red-50"
                : "border-primary text-primary hover:bg-primary/10"
            }`}
          >
            {localProject.is_member ? "Leave Project" : "Join Project"}
          </button>
        </div>

        {/* Members */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-1">Team Members</h3>
          <div className="flex flex-wrap gap-2">
            {localProject.team_members
              ?.split(", ")
              .filter(Boolean)
              .map((name) => (
                <span
                  key={name}
                  className="text-[11px] px-2 py-1 bg-neutral-light border border-gray-200 rounded-full"
                >
                  {name}
                </span>
              ))}

            {(!localProject.team_members ||
              localProject.team_members.trim() === "") && (
              <span className="text-xs text-gray-400">No team members yet.</span>
            )}
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-1">
            Recent Updates
          </h3>

          {updates.length === 0 ? (
            <p className="text-xs text-gray-500">No updates for this project.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {updates.slice(0, 10).map((u) => (
                <div
                  key={u.id}
                  className="p-3 border border-gray-100 rounded-xl bg-neutral-light"
                >
                  <p className="text-[12px] mb-1">
                    <span className="font-semibold text-secondary">
                      {u.user_name}
                    </span>{" "}
                    — {new Date(u.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">{u.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3">{error}</p>
        )}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        .animate-enterModal {
          animation: modalSlideIn 0.25s ease-out;
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
