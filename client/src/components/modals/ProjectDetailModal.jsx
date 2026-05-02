import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, FileText, Github, Send, X } from "lucide-react";
import ConfirmModal from "../shared/ConfirmModal";
import {
  updateProjectStatus,
  updateProjectLinks,
  addProjectMember,
  removeProjectMember,
  fetchProjectDiscussions,
  postProjectDiscussion,
  updateUser as updateUserProfile,
} from "../../utils/api";
import { useUser } from "../../context/UserContext";
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
  const { updateUser: updateCurrentUser } = useUser() || {};
  const [localProject, setLocalProject] = useState(project);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolioDetails, setPortfolioDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [discussionError, setDiscussionError] = useState("");
  const [discussionDraft, setDiscussionDraft] = useState("");
  const [discussionPosting, setDiscussionPosting] = useState(false);
  const [linkEditing, setLinkEditing] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [isFeaturedProject, setIsFeaturedProject] = useState(
    Number(currentUser?.featured_project_id) === Number(project?.id),
  );
  const [linkDraft, setLinkDraft] = useState({
    github_url: project?.github_url || "",
    live_url: project?.live_url || "",
    case_study_problem: project?.case_study_problem || "",
    case_study_solution: project?.case_study_solution || "",
    case_study_tech_stack: project?.case_study_tech_stack || "",
    case_study_outcomes: project?.case_study_outcomes || "",
    case_study_artifact_url: project?.case_study_artifact_url || "",
  });

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
    setDiscussionMessages([]);
    setDiscussionDraft("");
    setDiscussionError("");
    setLinkEditing(false);
    setIsFeaturedProject(
      Number(currentUser?.featured_project_id) === Number(project?.id),
    );
    setLinkDraft({
      github_url: project?.github_url || "",
      live_url: project?.live_url || "",
      case_study_problem: project?.case_study_problem || "",
      case_study_solution: project?.case_study_solution || "",
      case_study_tech_stack: project?.case_study_tech_stack || "",
      case_study_outcomes: project?.case_study_outcomes || "",
      case_study_artifact_url: project?.case_study_artifact_url || "",
    });
  }, [currentUser?.featured_project_id, project]);

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
  }, [isOpen, project, fetchPortfolioDetails]);

  useEffect(() => {
    if (!isOpen || !project?.id || !currentUser?.id) return;

    async function loadDiscussion() {
      try {
        setDiscussionLoading(true);
        setDiscussionError("");
        const data = await fetchProjectDiscussions(project.id, currentUser.id);
        setDiscussionMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load project discussion:", err);
        setDiscussionError("Project discussion could not be loaded.");
      } finally {
        setDiscussionLoading(false);
      }
    }

    loadDiscussion();
  }, [isOpen, project?.id, currentUser?.id]);

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
    } catch {
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
    } catch {
      setError("Could not update membership.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscussionSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.id || !discussionDraft.trim()) return;

    try {
      setDiscussionPosting(true);
      setDiscussionError("");
      const message = await postProjectDiscussion(
        project.id,
        currentUser.id,
        discussionDraft.trim(),
      );
      setDiscussionMessages((prev) => [...prev, message]);
      setDiscussionDraft("");
    } catch (err) {
      console.error("Failed to post project discussion:", err);
      setDiscussionError(err.message || "Could not post discussion message.");
    } finally {
      setDiscussionPosting(false);
    }
  };

  const resetLinkDraft = () => {
    const source = portfolioDetails?.project || localProject;
    setLinkDraft({
      github_url: source?.github_url || "",
      live_url: source?.live_url || "",
      case_study_problem: source?.case_study_problem || "",
      case_study_solution: source?.case_study_solution || "",
      case_study_tech_stack: source?.case_study_tech_stack || "",
      case_study_outcomes: source?.case_study_outcomes || "",
      case_study_artifact_url: source?.case_study_artifact_url || "",
    });
  };

  const handleLinkSave = async (event) => {
    event.preventDefault();
    if (!currentUser?.id) return;

    try {
      setLinkSaving(true);
      setError("");
      const updatedProject = await updateProjectLinks(
        project.id,
        currentUser.id,
        {
          github_url: linkDraft.github_url.trim(),
          live_url: linkDraft.live_url.trim(),
          case_study_problem: linkDraft.case_study_problem.trim(),
          case_study_solution: linkDraft.case_study_solution.trim(),
          case_study_tech_stack: linkDraft.case_study_tech_stack.trim(),
          case_study_outcomes: linkDraft.case_study_outcomes.trim(),
          case_study_artifact_url: linkDraft.case_study_artifact_url.trim(),
        },
      );

      setLocalProject((prev) => ({ ...prev, ...updatedProject }));
      setPortfolioDetails((prev) =>
        prev?.project ?
          { ...prev, project: { ...prev.project, ...updatedProject } }
        : prev,
      );
      setLinkDraft({
        github_url: updatedProject.github_url || "",
        live_url: updatedProject.live_url || "",
        case_study_problem: updatedProject.case_study_problem || "",
        case_study_solution: updatedProject.case_study_solution || "",
        case_study_tech_stack: updatedProject.case_study_tech_stack || "",
        case_study_outcomes: updatedProject.case_study_outcomes || "",
        case_study_artifact_url: updatedProject.case_study_artifact_url || "",
      });
      setLinkEditing(false);
      onProjectUpdate?.();
    } catch (err) {
      setError(err.message || "Could not update project case study.");
    } finally {
      setLinkSaving(false);
    }
  };

  const handleFeatureProject = async () => {
    if (!currentUser?.id || !project?.id) return;

    try {
      setFeatureSaving(true);
      setError("");
      const updatedUser = await updateUserProfile(currentUser.id, {
        featured_project_id: project.id,
      });
      setIsFeaturedProject(true);
      updateCurrentUser?.({
        featured_project_id: updatedUser.featured_project_id,
      });
      onProjectUpdate?.();
    } catch (err) {
      setError(err.message || "Could not feature this project.");
    } finally {
      setFeatureSaving(false);
    }
  };

  // Determine which updates/team to show
  const displayUpdates = portfolioDetails?.updates || updates;
  const displayTeam = portfolioDetails?.team || [];
  const detailProject = portfolioDetails?.project || localProject;
  const projectLinks = [
    {
      href: detailProject?.github_url || localProject.github_url,
      label: "GitHub",
      icon: Github,
    },
    {
      href: detailProject?.live_url || localProject.live_url,
      label: "Live Project",
      icon: ExternalLink,
    },
    {
      href:
        detailProject?.case_study_artifact_url ||
        localProject.case_study_artifact_url,
      label: "Artifact",
      icon: FileText,
    },
  ].filter((link) => link.href);
  const caseStudy = {
    problem: detailProject?.case_study_problem || localProject.case_study_problem,
    solution:
      detailProject?.case_study_solution || localProject.case_study_solution,
    techStack:
      detailProject?.case_study_tech_stack ||
      localProject.case_study_tech_stack,
    outcomes:
      detailProject?.case_study_outcomes || localProject.case_study_outcomes,
  };
  const techStackItems =
    caseStudy.techStack ?
      caseStudy.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const hasCaseStudy =
    Boolean(caseStudy.problem) ||
    Boolean(caseStudy.solution) ||
    Boolean(caseStudy.outcomes) ||
    techStackItems.length > 0;
  const canPostDiscussion =
    currentUser &&
    (currentUser.role === "admin" ||
      localProject.owner_id === currentUser.id ||
      localProject.is_member === 1 ||
      localProject.is_member === true);
  const canEditProjectLinks =
    currentUser &&
    (currentUser.role === "admin" || localProject.owner_id === currentUser.id);
  const canFeatureProject =
    currentUser &&
    (localProject.owner_id === currentUser.id ||
      localProject.is_member === 1 ||
      localProject.is_member === true);

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

        <div className="mb-3">
          {linkEditing ? (
            <form
              onSubmit={handleLinkSave}
              className="rounded-lg border border-border bg-surface-highlight/50 p-3 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <Github className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <input
                    type="url"
                    value={linkDraft.github_url}
                    onChange={(event) =>
                      setLinkDraft((prev) => ({
                        ...prev,
                        github_url: event.target.value,
                      }))
                    }
                    placeholder="GitHub repo URL"
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-dark outline-none placeholder-text-secondary"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <ExternalLink className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <input
                    type="url"
                    value={linkDraft.live_url}
                    onChange={(event) =>
                      setLinkDraft((prev) => ({
                        ...prev,
                        live_url: event.target.value,
                      }))
                    }
                    placeholder="Live project URL"
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-dark outline-none placeholder-text-secondary"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <textarea
                  value={linkDraft.case_study_problem}
                  onChange={(event) =>
                    setLinkDraft((prev) => ({
                      ...prev,
                      case_study_problem: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Problem this project solves"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none resize-none placeholder-text-secondary"
                />
                <textarea
                  value={linkDraft.case_study_solution}
                  onChange={(event) =>
                    setLinkDraft((prev) => ({
                      ...prev,
                      case_study_solution: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Solution the team built"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none resize-none placeholder-text-secondary"
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                <FileText className="w-4 h-4 text-text-secondary flex-shrink-0" />
                <input
                  type="url"
                  value={linkDraft.case_study_artifact_url}
                  onChange={(event) =>
                    setLinkDraft((prev) => ({
                      ...prev,
                      case_study_artifact_url: event.target.value,
                    }))
                  }
                  placeholder="Artifact URL (demo video, docs, screenshot album)"
                  className="min-w-0 flex-1 bg-transparent text-sm text-neutral-dark outline-none placeholder-text-secondary"
                />
              </label>

              <input
                type="text"
                value={linkDraft.case_study_tech_stack}
                onChange={(event) =>
                  setLinkDraft((prev) => ({
                    ...prev,
                    case_study_tech_stack: event.target.value,
                  }))
                }
                placeholder="Tech stack, comma separated"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none placeholder-text-secondary"
              />

              <textarea
                value={linkDraft.case_study_outcomes}
                onChange={(event) =>
                  setLinkDraft((prev) => ({
                    ...prev,
                    case_study_outcomes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Outcomes, impact, or what changed"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none resize-none placeholder-text-secondary"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={linkSaving}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {linkSaving ? "Saving..." : "Save Case Study"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetLinkDraft();
                    setLinkEditing(false);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-neutral-dark hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {projectLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-1.5 text-sm text-neutral-dark hover:border-primary/40 hover:text-primary transition"
                >
                  {React.createElement(link.icon, { className: "w-4 h-4" })}
                  {link.label}
                </a>
              ))}
              {canFeatureProject && (
                <button
                  type="button"
                  onClick={handleFeatureProject}
                  disabled={featureSaving || isFeaturedProject}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-surface-highlight disabled:opacity-60 disabled:cursor-default"
                >
                  {isFeaturedProject ?
                    "Featured on Profile"
                  : featureSaving ?
                    "Featuring..."
                  : "Feature on Profile"}
                </button>
              )}
              {canEditProjectLinks && (
                <button
                  type="button"
                  onClick={() => {
                    resetLinkDraft();
                    setLinkEditing(true);
                  }}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-surface-highlight"
                >
                  {hasCaseStudy || projectLinks.length > 0 ?
                    "Edit Case Study"
                  : "Add Case Study"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1 border-b border-border mb-4 mt-3">
          {["overview", "activity", "discussion"].map((tab) => (
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
              : tab === "discussion" ?
                `Discussion${discussionMessages.length > 0 ? ` (${discussionMessages.length})` : ""}`
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
                    Public - View Only
                  </span>
                )}
              </div>
            )}

            {hasCaseStudy && (
              <div className="rounded-xl border border-border bg-surface-highlight/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Case Study
                  </h3>
                  {techStackItems.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {techStackItems.slice(0, 6).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {caseStudy.problem && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                        Problem
                      </p>
                      <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                        {caseStudy.problem}
                      </p>
                    </div>
                  )}
                  {caseStudy.solution && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                        Solution
                      </p>
                      <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                        {caseStudy.solution}
                      </p>
                    </div>
                  )}
                </div>

                {caseStudy.outcomes && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                      Outcomes
                    </p>
                    <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                      {caseStudy.outcomes}
                    </p>
                  </div>
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
                        - {new Date(u.created_at).toLocaleDateString()}
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

        {activeTab === "discussion" && (
          <div className="space-y-4">
            {!currentUser ? (
              <p className="text-xs text-text-secondary">
                Sign in to view project discussion.
              </p>
            ) : discussionLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {discussionMessages.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-surface-highlight/50 px-4 py-6 text-center">
                      <p className="text-sm font-medium text-neutral-dark">
                        No project discussion yet
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Keep project-specific questions, blockers, and decisions here.
                      </p>
                    </div>
                  ) : (
                    discussionMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg border border-border bg-surface-highlight p-3"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-dark truncate">
                              {message.user_name}
                            </p>
                            <p className="text-xs text-text-secondary capitalize">
                              {message.user_role}
                              {message.user_cycle ?
                                ` - ${message.user_cycle}`
                              : ""}
                            </p>
                          </div>
                          <span className="text-xs text-text-secondary flex-shrink-0">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {discussionError && (
                  <p className="text-xs text-red-500">{discussionError}</p>
                )}

                {canPostDiscussion ? (
                  <form
                    onSubmit={handleDiscussionSubmit}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      value={discussionDraft}
                      onChange={(event) =>
                        setDiscussionDraft(event.target.value)
                      }
                      rows={2}
                      placeholder="Ask a project question or share a decision..."
                      className="flex-1 min-h-[44px] max-h-28 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={
                        discussionPosting || discussionDraft.trim().length === 0
                      }
                      className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Post project discussion"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-text-secondary">
                    Join this project to participate in the discussion.
                  </p>
                )}
              </>
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
