import React, { useEffect, useState } from "react";
import {
  updateProjectStatus,
  addProjectMember,
  removeProjectMember,
} from "../../utils/api";

import MemberModal from "./MemberModal";
import ProjectDetailModal from "../../components/modals/ProjectDetailModal";
import ConfirmModal from "../../components/shared/ConfirmModal";
import { useUser } from "../../context/UserContext";

export default function ProjectList({
  selectedProject,
  setSelectedProject,
  updatesData = [],
  projects: passedProjects = [], // ← NEW: Accept projects as prop
  loading: passedLoading = false, // ← NEW: Accept loading state as prop
  onRefresh, // NEW: Accept refresh callback
}) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(null);
  const { user: currentUser } = useUser();

  const [showMembersFor, setShowMembersFor] = useState(null);
  const [modalProject, setModalProject] = useState(null);

  // ✅ Use passed-in projects instead of fetching
  useEffect(() => {
    if (passedProjects && passedProjects.length > 0) {
      setProjects(passedProjects);
    }
  }, [passedProjects]);

  // 7-day activity bucket
  const now = new Date();
  const dayBuckets = [...Array(7)].map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const activityMap = updatesData.reduce((acc, upd) => {
    const created = new Date(upd.created_at);
    const midnight = new Date(created);
    midnight.setHours(0, 0, 0, 0);

    const daysAgo = Math.floor((now - midnight) / (1000 * 60 * 60 * 24));

    if (daysAgo >= 0 && daysAgo < 7) {
      const projId = upd.project_id;
      if (!acc[projId]) acc[projId] = Array(7).fill(0);
      const bucketIndex = 6 - daysAgo;
      acc[projId][bucketIndex] += 1;
    }
    return acc;
  }, {});

  const statusColors = {
    planned: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-red-100 text-red-600",
  };

  // Update status
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null); // { id, status }

  // Status Change Logic
  const initiateStatusChange = (id, nextStatus) => {
    if (nextStatus === "completed") {
      setConfirmStatus({ id, status: nextStatus });
    } else {
      executeStatusChange(id, nextStatus);
    }
  };

  const executeStatusChange = async (id, nextStatus) => {
    setError("");
    const previous = projects;

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
    );

    setStatusLoading(true);
    try {
      await updateProjectStatus(id, nextStatus, currentUser?.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError("Could not update project status.");
      setProjects(previous);
    } finally {
      setStatusLoading(false);
      setConfirmStatus(null);
    }
  };

  // Refresh projects after membership changes
  const refreshProjects = async () => {
    try {
      if (!currentUser?.id) return;
      // Update from passed-in projects (parent will handle reload)
      if (onRefresh) onRefresh();
    } catch {
      setError("Failed to refresh projects.");
    }
  };

  // JOIN / LEAVE project
  const handleMembership = async (projectId, isMember) => {
    if (!currentUser?.id) return;

    setError("");
    setJoining(projectId);

    // optimistic update
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        const names =
          p.team_members && typeof p.team_members === "string" ?
            p.team_members.split(", ").filter(Boolean)
          : [];

        const details =
          Array.isArray(p.team_member_details) && p.team_member_details.length ?
            p.team_member_details
          : [];

        let nextNames = names;
        let nextDetails = details;
        let nextCount = p.team_count ? Number(p.team_count) : 0;

        if (isMember) {
          nextNames = names.filter((n) => n !== currentUser.name);
          nextDetails = details.filter((d) => d.name !== currentUser.name);
          nextCount = Math.max(0, nextCount - 1);
        } else {
          if (!names.includes(currentUser.name)) {
            nextNames = [...names, currentUser.name];
          }
          if (!details.find((d) => d.name === currentUser.name)) {
            nextDetails = [
              ...details,
              {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email || "",
                role: currentUser.role || "",
                join_date: new Date().toISOString(),
              },
            ];
          }
          nextCount += 1;
        }

        return {
          ...p,
          is_member: isMember ? 0 : 1,
          team_members: nextNames.join(", "),
          team_member_details: nextDetails,
          team_count: nextCount,
        };
      }),
    );

    try {
      if (isMember) {
        await removeProjectMember(projectId, currentUser.id);
      } else {
        await addProjectMember(projectId, currentUser.id);
      }

      await refreshProjects();
    } catch {
      setError("Could not update membership.");
      await refreshProjects();
    } finally {
      setJoining(null);
    }
  };

  // Loading skeleton
  if (passedLoading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  // Render list
  return (
    <>
      {/* MEMBER MODAL */}
      {showMembersFor && (
        <MemberModal
          members={showMembersFor.team_member_details || []}
          onClose={() => setShowMembersFor(null)}
        />
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() =>
          confirmStatus &&
          executeStatusChange(confirmStatus.id, confirmStatus.status)
        }
        title="Mark as Complete?"
        message="This will move the project to your Portfolio and notify all team members. Are you sure?"
        confirmText="Complete Project"
        confirmColor="green"
        icon="success"
        loading={statusLoading}
      />

      {/* PROJECT MODAL */}
      {modalProject && (
        <ProjectDetailModal
          project={modalProject}
          currentUser={currentUser}
          updates={updatesData.filter((u) => u.project_id === modalProject.id)}
          onClose={() => setModalProject(null)}
          onProjectUpdate={onRefresh}
        />
      )}

      <div className="flex flex-col gap-3">
        {error && <p className="text-xs text-red-500">{error}</p>}

        {projects.map((project) => {
          const active = selectedProject?.id === project.id;
          const activity = activityMap[project.id] || [];

          return (
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                setSelectedProject(
                  active ? null : { id: project.id, title: project.title },
                )
              }
              onDoubleClick={() => setModalProject(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setModalProject(project);
              }}
              className={`w-full text-left p-4 rounded-xl border transition shadow-sm
                ${
                  active ?
                    "bg-secondary/20 border-secondary"
                  : "bg-white border-gray-200 hover:shadow-md"
                }
                cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-primary">{project.title}</h3>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full capitalize ${
                      statusColors[project.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {project.status}
                  </span>

                  {/* Smart Status Dropdown - Only show valid next actions */}
                  {(() => {
                    const isOwner = project.owner_id === currentUser?.id;
                    const isMentor = currentUser?.role === 'mentor';
                    
                    // Helper function to get valid next actions
                    const getValidActions = () => {
                      if (!isOwner) return []; // Only owners can change status
                      
                      switch (project.status) {
                        case 'planned':
                          return [
                            { value: 'planned', label: 'Planned', disabled: true },
                            { value: 'active', label: '▶️ Start Project' }
                          ];
                        
                        case 'active':
                          // Mentors can't complete projects
                          if (isMentor) {
                            return [
                              { value: 'active', label: 'Active', disabled: true }
                            ];
                          }
                          return [
                            { value: 'active', label: 'Active', disabled: true },
                            { value: 'completed', label: '✓ Mark Complete' }
                          ];
                        
                        case 'completed':
                          return [
                            { value: 'completed', label: 'Completed', disabled: true },
                            { value: 'archived', label: '📦 Archive' }
                          ];
                        
                        case 'archived':
                          return [
                            { value: 'archived', label: 'Archived', disabled: true }
                          ];
                        
                        default:
                          return [];
                      }
                    };

                    const validActions = getValidActions();

                    // If no valid actions (not owner or archived), don't show dropdown
                    if (validActions.length <= 1) {
                      return null;
                    }

                    return (
                      <select
                        value={project.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.value !== project.status) {
                            initiateStatusChange(project.id, e.target.value);
                          }
                        }}
                        className="text-[11px] border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none hover:border-primary transition"
                        onClick={(e) => e.stopPropagation()} // Prevent card selection
                      >
                        {validActions.map(action => (
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMembership(
                        project.id,
                        project.is_member === 1 || project.is_member === true,
                      );
                    }}
                    className={`text-[11px] px-2 py-1 rounded-full border transition ${
                      project.is_member ?
                        "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-primary text-primary hover:bg-primary/10"
                    }`}
                    disabled={joining === project.id}
                  >
                    {project.is_member ? "Leave" : "Join"}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600">{project.description}</p>

              {/* METRICS */}
              <div className="flex flex-wrap gap-3 items-center mt-3 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMembersFor(project);
                  }}
                  className="underline-offset-2 hover:underline"
                >
                  Team:{" "}
                  <span className="font-medium">{project.team_count ?? 0}</span>
                </button>

                <span>
                  Updates:{" "}
                  <span className="font-medium">
                    {project.update_count ?? 0}
                  </span>
                </span>

                {project.last_update && (
                  <span>
                    Last:{" "}
                    <span className="font-medium">
                      {new Date(project.last_update).toLocaleDateString()}
                    </span>
                  </span>
                )}
              </div>

              {/* MEMBER CHIPS */}
              {project.team_members && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.team_members
                    .split(", ")
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((name) => (
                      <span
                        key={name}
                        className="text-[10px] px-2 py-1 rounded-full bg-neutral-light text-neutral-dark border border-gray-100"
                      >
                        {name}
                      </span>
                    ))}

                  {project.team_members.split(", ").filter(Boolean).length >
                    4 && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-neutral-light text-neutral-dark border border-gray-100">
                      +
                      {project.team_members.split(", ").filter(Boolean).length -
                        4}{" "}
                      more
                    </span>
                  )}
                </div>
              )}

              {/* ACTIVITY CHART */}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Activity (7d)</span>
                  <span className="text-gray-400">
                    {activity.length > 0 ?
                      `${activity.reduce((a, b) => a + b, 0)} updates`
                    : "No updates"}
                  </span>
                </div>

                <div className="flex items-end gap-1 h-12">
                  {dayBuckets.map((day, idx) => {
                    const val = activity[idx] || 0;
                    const height = Math.min(100, val * 12);

                    return (
                      <div
                        key={day.toISOString() + idx}
                        className="flex-1 bg-neutral-light rounded-sm overflow-hidden"
                      >
                        <div
                          className="w-full bg-primary/70 rounded-sm transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <span>Tasks</span>
                  <div className="flex-1 h-2 bg-neutral-light rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-secondary/70" />
                  </div>
                  <span className="text-gray-400">Coming soon</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
