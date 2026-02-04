import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ConfirmModal from "../shared/ConfirmModal";
import {
  updateProjectStatus,
  addProjectMember,
  removeProjectMember,
} from "../../utils/api";
import styles from "./ProjectDetailModal.module.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function ProjectDetailModal({
  project,
  currentUser,
  updates = [], // For CollaborationHub
  onClose,
  isOpen = true, // For ProjectPortfolio compatibility
  fetchPortfolioDetails = false, // If true, fetch additional details
  onProjectUpdate, // NEW: Callback when project changes
}) {
  const [localProject, setLocalProject] = useState(project);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolioDetails, setPortfolioDetails] = useState(null);

  // Confirmation state
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  // Safely normalize metadata
  const rawSkillIdeas = project?.metadata?.skill_ideas ?? [];
  let skillIdeas = [];

  if (project?.metadata) {
    try {
      const metadata =
        typeof project.metadata === "string" ?
          JSON.parse(project.metadata)
        : project.metadata;

      if (Array.isArray(metadata?.skill_ideas)) {
        skillIdeas = metadata.skill_ideas;
      }
    } catch {
      skillIdeas = [];
    }
  }

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  // Fetch portfolio details if needed (for ProjectPortfolio view)
  useEffect(() => {
    if (!isOpen || !project || !fetchPortfolioDetails) return;

    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/projects/${project.id}/portfolio-details`,
        );
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        setPortfolioDetails(data);
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [isOpen, project?.id, fetchPortfolioDetails]);

  // Don't render if isOpen is false (for ProjectPortfolio compatibility)
  if (!isOpen) return null;

  const handleStatusChange = async (next) => {
    // Intercept completion for confirmation
    if (next === "completed") {
      setShowCompleteConfirm(true);
      return;
    }

    // Otherwise proceed normally
    await performStatusUpdate(next);
  };

  const performStatusUpdate = async (next) => {
    setStatusLoading(true);
    setError("");
    try {
      setLocalProject((p) => ({ ...p, status: next }));

      // Pass currentUser.id so backend knows who triggered it (for notifications)
      await updateProjectStatus(project.id, next, currentUser?.id);

      // Notify parent to refresh list (seamless update)
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (err) {
      setError("Could not update status.");
      setLocalProject(project);
    } finally {
      setStatusLoading(false);
      setShowCompleteConfirm(false);
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
          team_members:
            p.team_members ?
              p.team_members + ", " + currentUser.name
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

  // Determine which updates to show
  const displayUpdates = portfolioDetails?.updates || updates;
  const displayTeam = portfolioDetails?.team || [];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Card */}
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
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

        <p className="text-gray-600 text-sm mb-2">{localProject.description}</p>

        {skillIdeas.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Initial focus</p>
            <p className="text-sm text-gray-500">{skillIdeas.join(", ")}</p>
          </div>
        )}

        {/* Status + Join Row (only show if currentUser is available) */}
        {currentUser && (
          <div className="flex items-center gap-3 mb-4">
            {/* Smart Status Dropdown - Only show valid actions */}
            {(() => {
              const isOwner = localProject.owner_id === currentUser?.id;
              const isMentor = currentUser?.role === "mentor";

              const getValidActions = () => {
                if (!isOwner) return []; // Only owners can change status

                switch (localProject.status) {
                  case "planned":
                    return [
                      { value: "planned", label: "Planned", disabled: true },
                      { value: "active", label: "Start Project" },
                    ];

                  case "active":
                    if (isMentor) {
                      return [
                        { value: "active", label: "Active", disabled: true },
                      ];
                    }
                    return [
                      { value: "active", label: "Active", disabled: true },
                      { value: "completed", label: "Mark Complete" },
                    ];

                  case "completed":
                    return [
                      {
                        value: "completed",
                        label: "Completed",
                        disabled: true,
                      },
                      { value: "archived", label: "Archive" },
                    ];

                  case "archived":
                    return [
                      { value: "archived", label: "Archived", disabled: true },
                    ];

                  default:
                    return [];
                }
              };

              const validActions = getValidActions();

              // If no valid actions, don't show dropdown
              if (validActions.length <= 1) {
                return (
                  <span className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 capitalize">
                    {localProject.status}
                  </span>
                );
              }

              return (
                <select
                  value={localProject.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusLoading}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm hover:border-primary transition"
                >
                  {validActions.map((action) => (
                    <option
                      key={action.value}
                      value={action.value}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </option>
                  ))}
                </select>
              );
            })()}

            {/* Only show Join/Leave button for seeking projects, not public projects */}
            {localProject.visibility === "seeking" && (
              <button
                onClick={handleMembership}
                disabled={loading}
                className={`text-sm px-3 py-1 rounded-lg border transition ${
                  localProject.is_member ?
                    "border-red-300 text-red-600 hover:bg-red-50"
                  : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {localProject.is_member ? "Leave Project" : "Join Project"}
              </button>
            )}

            {/* Show view-only badge for public projects */}
            {localProject.visibility === "public" && (
              <span className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                Public - View Only
              </span>
            )}
          </div>
        )}

        {/* Team Members */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-primary mb-1">
            Team Members
          </h3>

          {/* Show detailed team if from portfolio */}
          {displayTeam.length > 0 ?
            <div className="grid grid-cols-2 gap-3">
              {displayTeam.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          : <div className="flex flex-wrap gap-2">
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
                <span className="text-xs text-gray-400">
                  No team members yet.
                </span>
              )}
            </div>
          }
        </div>

        {/* Portfolio Skills (if available) */}
        {portfolioDetails?.skills && portfolioDetails.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary mb-3">
              Skills Practiced ({portfolioDetails.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {portfolioDetails.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Updates */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-1">
            Recent Updates
          </h3>

          {displayUpdates.length === 0 ?
            <p className="text-xs text-gray-500">
              No updates for this project.
            </p>
          : <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {displayUpdates.slice(0, 10).map((u) => (
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
          }
        </div>

        {/* Mentorship Sessions (if available from portfolio) */}
        {portfolioDetails?.sessions && portfolioDetails.sessions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-primary mb-3">
              Mentorship Sessions ({portfolioDetails.sessions.length})
            </h3>
            <div className="space-y-2">
              {portfolioDetails.sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="font-medium text-blue-900">{session.topic}</p>
                  <p className="text-xs text-blue-700">
                    {new Date(session.session_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>
      {/* CONFIRMATION DIALOG */}
      <ConfirmModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={() => performStatusUpdate("completed")}
        title="Mark as Complete?"
        message="This will move the project to your Portfolio and notify all team members. Are you sure you're done?"
        confirmText="Yes, Complete Project"
        confirmColor="green"
        icon="success"
        loading={statusLoading}
      />
    </div>
  );
}
