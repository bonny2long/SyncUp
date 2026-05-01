import React, { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { fetchUpdates } from "../../utils/api";
import { getErrorMessage } from "../../utils/errorHandler";
import { useProjects } from "../../hooks/useProjects"; // Custom hook integrated
import { BarChart3, MousePointerClick } from "lucide-react";
import SkeletonLoader from "../../components/shared/SkeletonLoader";

// Lazy load components
const CreateProjectForm = lazy(() => import("./CreateProjectForm"));
const MyWorkPanel = lazy(() => import("./MyWorkPanel"));
const DiscoverPanel = lazy(() => import("./DiscoverPanel"));
const ActivityPanel = lazy(() => import("./ActivityPanel"));
const RequestsPanel = lazy(() => import("./RequestsPanel"));
const JoinProjectModal = lazy(() => import("./JoinProjectModal"));
const ProjectDetailModal = lazy(
  () => import("../../components/modals/ProjectDetailModal"),
);
const TeamDashboard = lazy(() => import("./TeamDashboard/TeamDashboard"));

// Layout-specific skeleton components for better UX
function DiscoverPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyWorkPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-3" />
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 p-3">
            <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Project Selector Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-1" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Activity Feed Skeleton */}
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />

      {/* Insight Skeleton */}
      <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />

      {/* Charts Skeleton (hidden by default) */}
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
}

export default function CollaborationHub() {
  const { user: currentUser } = useUser();
  const { addToast } = useToast();

  // Role checks
  const isIntern = currentUser?.role === "intern";
  const isMentor = currentUser?.role === "mentor";
  const canCreateProjects = ["intern", "resident", "alumni", "mentor"].includes(
    currentUser?.role,
  );

  // --- DATA FETCHING (Using Hook + Local Updates state) ---
  const {
    activeProjects: userProjects,
    discoverProjects,
    loading: projectsLoading,
    error: projectsError,
    refresh: refreshProjects,
  } = useProjects(currentUser?.id);

  // Cache for stable data - only refreshes on explicit refresh or first load
  const [cachedProjects, setCachedProjects] = useState([]);
  const [cachedDiscover, setCachedDiscover] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Update cache when projects load
  useEffect(() => {
    if (!projectsLoading && userProjects.length > 0) {
      if (
        cachedProjects.length === 0 ||
        Date.now() - lastFetchTime > CACHE_DURATION
      ) {
        setCachedProjects(userProjects);
        setCachedDiscover(discoverProjects);
        setLastFetchTime(Date.now());
      }
    }
  }, [projectsLoading, userProjects, discoverProjects]);

  // Use cached data for initial render, but still show fresh data
  const displayProjects =
    projectsLoading && cachedProjects.length > 0 ?
      cachedProjects
    : userProjects;
  const displayDiscover =
    projectsLoading && cachedDiscover.length > 0 ?
      cachedDiscover
    : discoverProjects;

  const [allUpdates, setAllUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [updatesError, setUpdatesError] = useState("");

  // Combined status - only show loading on first load
  const loading = projectsLoading && cachedProjects.length === 0;
  const error = projectsError || updatesError;

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("collaborationHubActiveTab");
    if (!saved) {
      return isMentor ? "browse" : "mywork";
    }
    return saved;
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [projectToJoin, setProjectToJoin] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [teamAnalyticsProject, setTeamAnalyticsProject] = useState(null);

  // Persist tab choice
  useEffect(() => {
    localStorage.setItem("collaborationHubActiveTab", activeTab);
  }, [activeTab]);

  // Load updates separately
  const loadUpdates = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setUpdatesError("");
      setUpdatesLoading(true);
      const updatesData = await fetchUpdates();
      setAllUpdates(updatesData);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setUpdatesError(message);
    } finally {
      setUpdatesLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const loadData = () => {
    refreshProjects();
    loadUpdates();
  };

  // --- FILTERING & DERIVED DATA ---
  const userUpdates = allUpdates.filter((u) => u.user_id === currentUser?.id);

  const mentorOwnsProjects =
    isMentor && userProjects.some((p) => p.owner_id === currentUser?.id);

  // --- HANDLERS ---
  const handleJoinClick = (project) => {
    setProjectToJoin(project);
    setShowJoinModal(true);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleJoinConfirm = async () => {
    if (!projectToJoin) return;
    setJoining(true);
    try {
      const { createJoinRequest } = await import("../../utils/api");
      await createJoinRequest(projectToJoin.id, currentUser.id);
      setShowJoinModal(false);
      setProjectToJoin(null);
      addToast({
        type: "success",
        message: `Request sent! The project owner will review it soon.`,
      });
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast({ type: "error", message: message || "Failed to send request" });
    } finally {
      setJoining(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedProject(null);
  };

  // --- STATS CONFIG ---
  const statsCards =
    isMentor ?
      [
        {
          label: "Projects You're On",
          value: displayProjects.length,
          color: "text-primary",
        },
        {
          label: "Available Projects",
          value: displayDiscover.length,
          color: "text-accent",
        },
        {
          label: "Your Contributions",
          value: userUpdates.length,
          color: "text-secondary",
        },
        {
          label: "Teams Helped",
          value: displayProjects.filter((p) => p.owner_id !== currentUser?.id)
            .length,
          color: "text-green-600",
        },
      ]
    : [
        {
          label: "Your Projects",
          value: displayProjects.length,
          color: "text-primary",
        },
        {
          label: "Available to Join",
          value: displayDiscover.length,
          color: "text-accent",
        },
        {
          label: "Your Updates",
          value: userUpdates.length,
          color: "text-secondary",
        },
        {
          label: "Active",
          value: displayProjects.filter((p) => p.status === "active").length,
          color: "text-primary",
        },
      ];

  return (
    <div className="flex flex-col gap-6">
      {/* Role-Specific Header Items */}
      {canCreateProjects && (
        <Suspense
          fallback={
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          }
        >
          <CreateProjectForm onCreated={loadData} />
        </Suspense>
      )}

      {isMentor && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20 dark:from-primary/20 dark:to-secondary/20">
          <h3 className="text-lg font-bold text-primary mb-2">
            Share Your Expertise
          </h3>
          <p className="text-sm text-text-secondary">
            Browse active projects and join teams as a senior contributor.
          </p>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-surface p-4 rounded-lg border border-border shadow-sm"
          >
            <p className="text-xs text-text-secondary mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => handleTabChange(isMentor ? "browse" : "mywork")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === (isMentor ? "browse" : "mywork") ?
              "text-primary border-b-2 border-primary"
            : "text-text-secondary"
          }`}
        >
          {isMentor ? "Browse Projects" : "My Work"} (
          {isMentor ? displayDiscover.length : displayProjects.length})
        </button>

        <button
          onClick={() => handleTabChange(isMentor ? "myprojects" : "discover")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === (isMentor ? "myprojects" : "discover") ?
              "text-accent border-b-2 border-accent"
            : "text-text-secondary"
          }`}
        >
          {isMentor ? "My Projects" : "Discover"} (
          {isMentor ? displayProjects.length : displayDiscover.length})
        </button>

        {(isIntern || mentorOwnsProjects) && (
          <button
            onClick={() => handleTabChange("requests")}
            className={`px-4 py-3 font-medium transition-all duration-300 ${activeTab === "requests" ? "text-secondary border-b-2 border-secondary" : "text-text-secondary"}`}
          >
            Requests
          </button>
        )}

        <button
          onClick={() => handleTabChange("activity")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${activeTab === "activity" ? "text-secondary border-b-2 border-secondary" : "text-text-secondary"}`}
        >
          {isMentor ? "Contributions" : "Activity"} ({userUpdates.length})
        </button>

        {/* Team Analytics Tab - Show for users with projects */}
        {displayProjects.length > 0 && (
          <button
            onClick={() => {
              handleTabChange("team");
              // Set first project as default for team analytics
              if (!teamAnalyticsProject && displayProjects.length > 0) {
                setTeamAnalyticsProject(displayProjects[0]);
              }
            }}
            className={`px-4 py-3 font-medium transition-all duration-300 ${activeTab === "team" ? "text-secondary border-b-2 border-secondary" : "text-text-secondary"}`}
          >
            Team Analytics
          </button>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="min-h-[600px]">
        {activeTab === "team" ?
          <div className="w-full animate-fade-in">
            {/* Project Selector - Always visible */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-border rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-dark leading-tight">
                    Team Analytics
                  </h3>
                  <p className="text-xs text-text-secondary">
                    View team-wide signal distribution and momentum
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto min-w-[240px]">
                <select
                  value={teamAnalyticsProject?.id || ""}
                  onChange={(e) => {
                    const project = displayProjects.find(
                      (p) => p.id === parseInt(e.target.value),
                    );
                    setTeamAnalyticsProject(project);
                  }}
                  className="w-full px-3 py-2 bg-surface text-neutral-dark border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">Choose a project...</option>
                  {displayProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Dashboard with Suspense */}
            {teamAnalyticsProject ?
              <Suspense fallback={<TeamAnalyticsSkeleton />}>
                <TeamDashboard projectId={teamAnalyticsProject.id} />
              </Suspense>
            : <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center">
                <p className="text-text-secondary">
                  Please select a project to view team analytics
                </p>
              </div>
            }
          </div>
        : <div className="grid grid-cols-2 gap-6 text-left">
            {/* LEFT COLUMN: Panels */}
            <div className="text-left">
              {activeTab === (isMentor ? "browse" : "discover") && (
                <div className="animate-fade-in">
                  <Suspense fallback={<DiscoverPanelSkeleton />}>
                    <DiscoverPanel
                      projects={displayDiscover}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      onJoinClick={handleJoinClick}
                      onViewProject={handleViewProject}
                      loading={loading}
                    />
                  </Suspense>
                </div>
              )}

              {(activeTab === "mywork" || activeTab === "myprojects") && (
                <div className="animate-fade-in">
                  <Suspense fallback={<MyWorkPanelSkeleton />}>
                    <MyWorkPanel
                      projects={displayProjects}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      updatesData={allUpdates}
                      loading={loading}
                      isMentor={isMentor}
                      onRefresh={loadData}
                    />
                  </Suspense>
                </div>
              )}

              {activeTab === "requests" && (
                <div className="animate-fade-in">
                  <Suspense fallback={<RequestsPanelSkeleton />}>
                    <RequestsPanel onRefresh={loadData} />
                  </Suspense>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-4">
                  <div className="bg-surface rounded-lg border border-border p-5">
                    <h2 className="text-lg font-bold text-secondary mb-1">
                      {isMentor ? "Your Contributions" : "Your Updates"}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Activity summary and filter controls
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-3 bg-surface-highlight rounded-xl border border-border">
                        <p className="text-2xl font-bold text-secondary">
                          {
                            allUpdates.filter(
                              (u) => u.user_id === currentUser?.id,
                            ).length
                          }
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-medium mt-1">
                          Total Updates
                        </p>
                      </div>
                      <div className="p-3 bg-surface-highlight rounded-xl border border-border">
                        <p className="text-2xl font-bold text-primary">
                          {displayProjects.length}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-medium mt-1">
                          Active Projects
                        </p>
                      </div>
                    </div>

                    {selectedProject && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-text-secondary">
                            Active Filter:
                          </span>
                          <button
                            onClick={() => setSelectedProject(null)}
                            className="text-[10px] px-2 py-1 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-md transition"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                          <p className="text-xs font-semibold text-secondary truncate">
                            {selectedProject.title}
                          </p>
                        </div>
                      </div>
                    )}

                    {!selectedProject && (
                      <div className="mt-6 p-4 bg-accent/5 border border-dashed border-accent/20 rounded-xl text-center">
                        <p className="text-xs text-text-secondary">
                          Tip: Click a project in "My Work" to filter this feed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Previews / Activity Feed */}
            <div className="text-left">
              {(activeTab === "discover" || activeTab === "browse") && (
                <div className="bg-surface rounded-lg border border-border p-6">
                  <h2 className="text-lg font-bold text-neutral-dark mb-4">
                    Project Preview
                  </h2>
                  {selectedProject ?
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-neutral-dark mb-1">
                          {selectedProject.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {selectedProject.description}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-text-secondary">
                        <span>{selectedProject.team_count ?? 0} members</span>
                        <span>{selectedProject.skill_count ?? 0} skills</span>
                        <span className="capitalize">
                          {selectedProject.status}
                        </span>
                      </div>
                      {selectedProject.visibility === "seeking" && (
                        <button
                          onClick={() => handleJoinClick(selectedProject)}
                          className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium text-sm"
                        >
                          Request to Join{isMentor && " as Mentor"}
                        </button>
                      )}
                      {selectedProject.visibility === "public" && (
                        <button
                          onClick={() => handleViewProject(selectedProject)}
                          className="w-full mt-2 px-4 py-2 bg-surface-highlight text-text-secondary rounded-lg hover:bg-border transition font-medium text-sm"
                        >
                          View Project Details
                        </button>
                      )}
                    </div>
                  : <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <MousePointerClick className="w-6 h-6 text-accent" />
                      </div>
                      <p className="text-sm font-medium text-neutral-dark">
                        Select a project
                      </p>
                      <p className="text-xs text-text-secondary">
                        Click any project on the left to preview it here
                      </p>
                    </div>
                  }
                </div>
              )}

              {/* Activity Feed for MyWork/Activity Tabs */}
              {(activeTab === "mywork" ||
                activeTab === "myprojects" ||
                activeTab === "activity") && (
                <div className="animate-fade-in">
                  <Suspense fallback={<ActivityPanelSkeleton />}>
                    <ActivityPanel
                      selectedProject={selectedProject}
                      allUpdates={allUpdates}
                      currentUser={currentUser}
                      projectId={selectedProject?.id}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        }
      </div>

      {/* MODALS */}
      {showJoinModal && (
        <Suspense fallback={null}>
          <JoinProjectModal
            project={projectToJoin}
            onConfirm={handleJoinConfirm}
            onCancel={() => setShowJoinModal(false)}
            loading={joining}
          />
        </Suspense>
      )}

      {showDetailModal && selectedProject && (
        <Suspense fallback={null}>
          <ProjectDetailModal
            project={selectedProject}
            currentUser={currentUser}
            updates={allUpdates.filter(
              (u) => u.project_id === selectedProject.id,
            )}
            onClose={() => setShowDetailModal(false)}
            onProjectUpdate={loadData}
          />
        </Suspense>
      )}
    </div>
  );
}
