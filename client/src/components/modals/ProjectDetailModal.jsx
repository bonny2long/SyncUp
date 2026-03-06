import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  updates = [],
  onClose,
  isOpen = true,
  fetchPortfolioDetails = false,
  onProjectUpdate,
}) {
  const [localProject, setLocalProject] = useState(project);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolioDetails, setPortfolioDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Confirmation state
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  // Safely normalize metadata
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
    setActiveTab("overview");
  }, [project]);

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

  if (!isOpen) return null;

  const handleStatusChange = async (next) => {
    if (next === "completed") {
      setShowCompleteConfirm(true);
      return;
    }
    await performStatusUpdate(next);
  };

  const performStatusUpdate = async (next) => {
    setStatusLoading(true);
    setError("");
    try {
      setLocalProject((p) => ({ ...p, status: next }));
      await updateProjectStatus(project.id, next, currentUser?.id);
      if (onProjectUpdate) onProjectUpdate();
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

  // Determine which updates/team to show
  const displayUpdates = portfolioDetails?.updates || updates;
  const displayTeam = portfolioDetails?.team || [];

  // Status dropdown helper
  const getValidActions = () => {
    const isOwner = localProject.owner_id === currentUser?.id;
    const isMentor = currentUser?.role === "mentor";
    if (!isOwner) return [];

    switch (localProject.status) {
      case "planned":
        return [
          { value: "planned", label: "Planned", disabled: true },
          { value: "active", label: "Start Project" },
        ];
      case "active":
        if (isMentor)
          return [{ value: "active", label: "Active", disabled: true }];
        return [
          { value: "active", label: "Active", disabled: true },
          { value: "completed", label: "Mark Complete" },
        ];
      case "completed":
        return [
          { value: "completed", label: "Completed", disabled: true },
          { value: "archived", label: "Archive" },
        ];
      case "archived":
        return [{ value: "archived", label: "Archived", disabled: true }];
      default:
        return [];
    }
  };

  const validActions = currentUser ? getValidActions() : [];

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-surface-highlight transition"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <h2 className="text-xl font-semibold text-primary mb-1 pr-8">
          {localProject.title}
        </h2>
        <p className="text-text-secondary text-sm mb-1">
          {localProject.description}
        </p>
        {skillIdeas.length > 0 && (
          <p className="text-xs text-text-secondary mb-3">
            <span className="font-medium">Focus:</span> {skillIdeas.join(", ")}
          </p>
        )}

        <div className="flex gap-1 border-b border-border mb-4 mt-3">
          {["overview", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab ?
                  "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-neutral-dark"
              }`}
            >
              {tab === "activity" ?
                `Activity${displayUpdates.length > 0 ? ` (${displayUpdates.length})` : ""}`
              : "Overview"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-5">
            {currentUser && (
              <div className="flex items-center gap-3 flex-wrap">
                {validActions.length > 1 ?
                  <select
                    value={localProject.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusLoading}
                    className="border border-border bg-surface text-neutral-dark rounded-lg px-3 py-1 text-sm hover:border-primary transition"
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
                : <span className="text-sm px-3 py-1 rounded-lg bg-surface-highlight text-text-secondary capitalize">
                    {localProject.status}
                  </span>
                }

                {localProject.visibility === "seeking" && (
                  <button
                    onClick={handleMembership}
                    disabled={loading}
                    className={`text-sm px-3 py-1 rounded-lg border transition ${
                      localProject.is_member ?
                        "border-red-500/30 text-red-500 hover:bg-red-500/10"
                      : "border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    {localProject.is_member ? "Leave Project" : "Join Project"}
                  </button>
                )}

                {localProject.visibility === "public" && (
                  <span className="text-sm px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500">
                    Public · View Only
                  </span>
                )}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">
                Team Members
              </h3>
              {displayTeam.length > 0 ?
                <div className="grid grid-cols-2 gap-2">
                  {displayTeam.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-surface-highlight rounded-lg border border-border"
                    >
                      <p className="font-medium text-neutral-dark text-sm">
                        {member.name}
                      </p>
                      <p className="text-xs text-text-secondary capitalize">
                        {member.role}
                      </p>
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
                        className="text-[11px] px-2 py-1 bg-surface-highlight border border-border text-neutral-dark rounded-full"
                      >
                        {name}
                      </span>
                    ))}
                  {(!localProject.team_members ||
                    localProject.team_members.trim() === "") && (
                    <span className="text-xs text-text-secondary">
                      No team members yet.
                    </span>
                  )}
                </div>
              }
            </div>

            {portfolioDetails?.skills && portfolioDetails.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">
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
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">
                Recent Updates
              </h3>
              {displayUpdates.length === 0 ?
                <p className="text-xs text-text-secondary">
                  No updates for this project yet.
                </p>
              : <div className="flex flex-col gap-2">
                  {displayUpdates.slice(0, 10).map((u) => (
                    <div
                      key={u.id}
                      className="p-3 border border-border rounded-xl bg-surface-highlight"
                    >
                      <p className="text-[12px] mb-1">
                        <span className="font-semibold text-secondary">
                          {u.user_name}
                        </span>{" "}
                        — {new Date(u.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-dark">{u.content}</p>
                    </div>
                  ))}
                </div>
              }
            </div>

            {portfolioDetails?.sessions &&
              portfolioDetails.sessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    Mentorship Sessions ({portfolioDetails.sessions.length})
                  </h3>
                  <div className="space-y-2">
                    {portfolioDetails.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-surface-highlight rounded-lg border border-border"
                      >
                        <p className="font-medium text-blue-400 text-sm">
                          {session.topic}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {new Date(session.session_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>

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
    </div>,
    document.body,
  );
}
