import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import CreateProjectForm from "./CreateProjectForm";
import { fetchProjects, fetchUpdates } from "../../utils/api";
import MyWorkPanel from "./MyWorkPanel";
import DiscoverPanel from "./DiscoverPanel";
import ActivityPanel from "./ActivityPanel";
import RequestsPanel from "./RequestsPanel";
import JoinProjectModal from "./JoinProjectModal";
import { getErrorMessage } from "../../utils/errorHandler";

export default function CollaborationHub() {
  const { user: currentUser } = useUser();
  const { addToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("collaborationHubActiveTab") || "mywork";
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    localStorage.setItem("collaborationHubActiveTab", activeTab);
  }, [activeTab]);

  // Data state
  const [allProjects, setAllProjects] = useState([]);
  const [allUpdates, setAllUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selection & modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [projectToJoin, setProjectToJoin] = useState(null);
  const [joining, setJoining] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    if (!currentUser?.id) return;

    console.log("🔄 Loading CollaborationHub data for user:", currentUser.id);
    setError("");
    setLoading(true);

    try {
      const [projectsData, updatesData] = await Promise.all([
        fetchProjects(currentUser.id),
        fetchUpdates(),
      ]);

      setAllProjects(projectsData);
      setAllUpdates(updatesData);

      console.log("✅ Projects loaded:", projectsData.length);
      console.log("✅ Updates loaded:", updatesData.length);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========== DATA FILTERING ==========

  // Column 1: YOUR PROJECTS (owned + joined)
  const userProjects = allProjects.filter(
    (p) => p.is_member === 1 || p.is_member === true,
  );

  // Column 2: DISCOVER PROJECTS (projects you're NOT on + active only)
  const discoverProjects = allProjects.filter(
    (p) =>
      p.owner_id !== currentUser?.id && // You don't own it
      p.is_member !== 1 && // You're not a member
      p.is_member !== true &&
      p.status === "active", // Only active projects
  );

  // Column 3: YOUR UPDATES (current user only)
  const userUpdates = allUpdates.filter((u) => u.user_id === currentUser?.id);

  // ========== HANDLERS ==========

  const handleJoinClick = (project) => {
    setProjectToJoin(project);
    setShowJoinModal(true);
  };

  const handleJoinConfirm = async () => {
    if (!projectToJoin) return;

    setJoining(true);
    try {
      // Import here to avoid circular dependency
      const { createJoinRequest } = await import("../../utils/api");

      await createJoinRequest(projectToJoin.id, currentUser.id);

      // Close modal and clear
      setShowJoinModal(false);
      setProjectToJoin(null);

      // Show success toast
      addToast({
        type: "success",
        message: `Request sent! The project owner will review it soon. ✅`,
      });

      console.log("✅ Successfully sent request to join:", projectToJoin.title);
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast({
        type: "error",
        message: message || "Failed to send request",
      });
      console.error("Error sending request:", err);
    } finally {
      setJoining(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset selection when changing tabs
    setSelectedProject(null);
  };

  // ========== STATS ==========

  const statsCards = [
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
      {/* CREATE PROJECT FORM */}
      <CreateProjectForm onCreated={loadData} />

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

      {/* TAB NAVIGATION */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("mywork")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === "mywork" ?
              "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-neutralDark"
          }`}
        >
          My Work ({userProjects.length})
        </button>

        <button
          onClick={() => handleTabChange("discover")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === "discover" ?
              "text-accent border-b-2 border-accent"
            : "text-gray-600 hover:text-neutralDark"
          }`}
        >
          Discover ({discoverProjects.length})
        </button>

        <button
          onClick={() => handleTabChange("requests")}
          className={`px-4 py-3 font-medium transition-all duration-300 relative ${
            activeTab === "requests" ?
              "text-secondary border-b-2 border-secondary"
            : "text-gray-600 hover:text-neutralDark"
          }`}
        >
          Requests
          {/* Badge for pending requests */}
        </button>

        <button
          onClick={() => handleTabChange("activity")}
          className={`px-4 py-3 font-medium transition-all duration-300 ${
            activeTab === "activity" ?
              "text-secondary border-b-2 border-secondary"
            : "text-gray-600 hover:text-neutralDark"
          }`}
        >
          Activity ({userUpdates.length})
        </button>
      </div>

      {/* TAB CONTENT - TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-2 gap-6 min-h-[600px]">
        {/* LEFT COLUMN */}
        <div>
          {activeTab === "mywork" && (
            <MyWorkPanel
              projects={userProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              updatesData={allUpdates}
              loading={loading}
            />
          )}

          {activeTab === "discover" && (
            <DiscoverPanel
              projects={discoverProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              onJoinClick={handleJoinClick}
              loading={loading}
            />
          )}

          {activeTab === "requests" && <RequestsPanel onRefresh={loadData} />}

          {activeTab === "activity" && (
            <div>
              <h2 className="text-lg font-bold text-secondary mb-3">
                Your Updates
              </h2>
              <p className="text-sm text-gray-600">
                {selectedProject ?
                  `Filtered to: ${selectedProject.title}`
                : "All your updates"}
              </p>
              {selectedProject && (
                <button
                  onClick={() => setSelectedProject(null)}
                  className="mt-3 text-xs px-3 py-1 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition"
                >
                  ← Clear Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {activeTab === "mywork" && (
            <ActivityPanel
              selectedProject={selectedProject}
              allUpdates={allUpdates}
              currentUser={currentUser}
              projectId={selectedProject?.id}
            />
          )}

          {activeTab === "discover" && (
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-neutralDark mb-4">
                Project Preview
              </h2>
              {selectedProject ?
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-neutralDark">
                      {selectedProject.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Team Size</p>
                      <p className="text-lg font-bold text-primary">
                        {selectedProject.team_count ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Skills</p>
                      <p className="text-lg font-bold text-accent">
                        {selectedProject.skill_count ?? 0}
                      </p>
                    </div>
                  </div>

                  {selectedProject.team_member_details &&
                    selectedProject.team_member_details.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Team Members
                        </p>
                        <div className="space-y-1">
                          {selectedProject.team_member_details
                            .slice(0, 5)
                            .map((member) => (
                              <div
                                key={member.id}
                                className="text-xs text-gray-600"
                              >
                                {member.name}
                              </div>
                            ))}
                          {selectedProject.team_member_details.length > 5 && (
                            <div className="text-xs text-gray-500">
                              +{selectedProject.team_member_details.length - 5}{" "}
                              more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <button
                    onClick={() => handleJoinClick(selectedProject)}
                    className="w-full mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium"
                  >
                    Request to Join
                  </button>
                </div>
              : <p className="text-gray-500 text-center py-8">
                  Select a project to see details
                </p>
              }
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">
                How it works
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <p>
                  <strong>Request to Join:</strong> Users can request to join
                  your projects from the Discover tab.
                </p>
                <p>
                  <strong>You Approve:</strong> Review their profile and approve
                  or reject each request.
                </p>
                <p>
                  <strong>They Get Notified:</strong> Users are notified when
                  approved or rejected.
                </p>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <ActivityPanel
              selectedProject={selectedProject}
              allUpdates={allUpdates}
              currentUser={currentUser}
              projectId={selectedProject?.id}
            />
          )}
        </div>
      </div>

      {/* JOIN PROJECT MODAL */}
      {showJoinModal && (
        <JoinProjectModal
          project={projectToJoin}
          onConfirm={handleJoinConfirm}
          onCancel={() => {
            setShowJoinModal(false);
            setProjectToJoin(null);
          }}
          loading={joining}
        />
      )}
    </div>
  );
}
