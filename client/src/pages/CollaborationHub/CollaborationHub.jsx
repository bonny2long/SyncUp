import React, { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { fetchUpdates } from "../../utils/api";
import { getErrorMessage } from "../../utils/errorHandler";
import { useProjects } from "../../hooks/useProjects"; // Custom hook integrated

// Lazy load components
const CreateProjectForm = lazy(() => import("./CreateProjectForm"));
const MyWorkPanel = lazy(() => import("./MyWorkPanel"));
const DiscoverPanel = lazy(() => import("./DiscoverPanel"));
const ActivityPanel = lazy(() => import("./ActivityPanel"));
const RequestsPanel = lazy(() => import("./RequestsPanel"));
const JoinProjectModal = lazy(() => import("./JoinProjectModal"));
const ProjectDetailModal = lazy(() => import("../../components/modals/ProjectDetailModal"));

export default function CollaborationHub() {
  const { user: currentUser } = useUser();
  const { addToast } = useToast();

  // Role checks
  const isIntern = currentUser?.role === "intern";
  const isMentor = currentUser?.role === "mentor";

  // --- DATA FETCHING (Using Hook + Local Updates state) ---
  const {
    activeProjects: userProjects,
    discoverProjects,
    loading: projectsLoading,
    error: projectsError,
    refresh: refreshProjects,
  } = useProjects(currentUser?.id);

  const [allUpdates, setAllUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [updatesError, setUpdatesError] = useState("");

  // Combined status
  const loading = projectsLoading || updatesLoading;
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
          value: userProjects.length,
          color: "text-primary",
        },
        {
          label: "Available Projects",
          value: discoverProjects.length,
          color: "text-accent",
        },
        {
          label: "Your Contributions",
          value: userUpdates.length,
          color: "text-secondary",
        },
        {
          label: "Teams Helped",
          value: userProjects.filter((p) => p.owner_id !== currentUser?.id)
            .length,
          color: "text-green-600",
        },
      ]
    : [
        {
          label: "Your Projects",
          value: userProjects.length,
          color: "text-primary",
        },
        {
          label: "Available to Join",
          value: discoverProjects.length,
          color: "text-accent",
        },
        {
          label: "Your Updates",
          value: userUpdates.length,
          color: "text-secondary",
        },
        {
          label: "Active",
          value: userProjects.filter((p) => p.status === "active").length,
          color: "text-primary",
        },
      ];

  return (
    <div className="flex flex-col gap-6">
      {/* Role-Specific Header Items */}
      {isIntern && (
        <Suspense
          fallback={
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          }
        >
          <CreateProjectForm onCreated={loadData} />
        </Suspense>
      )}

      {isMentor && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg font-bold text-primary mb-2">
            Share Your Expertise
          </h3>
          <p className="text-sm text-gray-700">
            Browse active projects and join teams as a senior contributor.
          </p>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
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
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => handleTabChange(isMentor ? "browse" : "mywork")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === (isMentor ? "browse" : "mywork") ?
              "text-primary border-b-2 border-primary"
            : "text-gray-600"
          }`}
        >
          {isMentor ? "Browse Projects" : "My Work"} (
          {isMentor ? discoverProjects.length : userProjects.length})
        </button>

        <button
          onClick={() => handleTabChange(isMentor ? "myprojects" : "discover")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === (isMentor ? "myprojects" : "discover") ?
              "text-accent border-b-2 border-accent"
            : "text-gray-600"
          }`}
        >
          {isMentor ? "My Projects" : "Discover"} (
          {isMentor ? userProjects.length : discoverProjects.length})
        </button>

        {(isIntern || mentorOwnsProjects) && (
          <button
            onClick={() => handleTabChange("requests")}
            className={`px-4 py-3 font-medium transition-all duration-300 ${activeTab === "requests" ? "text-secondary border-b-2 border-secondary" : "text-gray-600"}`}
          >
            Requests
          </button>
        )}

        <button
          onClick={() => handleTabChange("activity")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${activeTab === "activity" ? "text-secondary border-b-2 border-secondary" : "text-gray-600"}`}
        >
          {isMentor ? "Contributions" : "Activity"} ({userUpdates.length})
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-2 gap-6 min-h-[600px]">
        {/* LEFT COLUMN: Panels */}
        <div>
          {activeTab === (isMentor ? "browse" : "discover") && (
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <DiscoverPanel
                projects={discoverProjects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                onJoinClick={handleJoinClick}
                onViewProject={handleViewProject}
                loading={loading}
              />
            </Suspense>
          )}

          {(activeTab === "mywork" || activeTab === "myprojects") && (
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <MyWorkPanel
                projects={userProjects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                updatesData={allUpdates}
                loading={loading}
                isMentor={isMentor}
                onRefresh={loadData}
              />
            </Suspense>
          )}

          {activeTab === "requests" && (
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <RequestsPanel onRefresh={loadData} />
            </Suspense>
          )}

          {activeTab === "activity" && (
            <div>
              <h2 className="text-lg font-bold text-secondary mb-3">
                {isMentor ? "Your Contributions" : "Your Updates"}
              </h2>
              {/* Filter clear button logic remains same... */}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Previews / Activity Feed */}
        <div>
          {/* Detailed Project Preview (shared by Discover/Browse) */}
          {(activeTab === "discover" || activeTab === "browse") && (
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-neutralDark mb-4">
                Project Preview
              </h2>
              {selectedProject ?
                <div className="space-y-4">
                  {/* ... Preview content ... */}
                  <button
                    onClick={() => handleJoinClick(selectedProject)}
                    className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    Request to Join {isMentor && "as Mentor"}
                  </button>
                </div>
              : <p className="text-gray-500 text-center py-8">
                  Select a project to see details
                </p>
              }
            </div>
          )}

          {/* Activity Feed for MyWork/Activity Tabs */}
          {(activeTab === "mywork" ||
            activeTab === "myprojects" ||
            activeTab === "activity") && (
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <ActivityPanel
                selectedProject={selectedProject}
                allUpdates={allUpdates}
                currentUser={currentUser}
                projectId={selectedProject?.id}
              />
            </Suspense>
          )}
        </div>
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
            updates={allUpdates.filter((u) => u.project_id === selectedProject.id)}
            onClose={() => setShowDetailModal(false)}
            onProjectUpdate={loadData}
          />
        </Suspense>
      )}
    </div>
  );
}
