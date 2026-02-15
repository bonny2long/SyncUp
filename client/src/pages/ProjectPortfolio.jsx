import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/shared/SkeletonLoader";
import { ChartError } from "../components/shared/ErrorBoundary";
import ProjectCard from "../components/shared/ProjectCard"; // CHANGED: Use shared component
import ProjectDetailModal from "../components/modals/ProjectDetailModal";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useProjects } from "../hooks/useProjects"; // NEW: Use shared hook

const STATUS_OPTIONS = [
  { value: "all", label: "All Projects" },
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "skills", label: "Most Skills" },
  { value: "updates", label: "Most Updates" },
  { value: "team", label: "Largest Team" },
];

export default function ProjectPortfolio() {
  const { user } = useUser();
  const { addToast } = useToast();

  // USE SHARED HOOK instead of fetching manually
  const {
    myProjects: projects,
    loading,
    error,
    refresh,
  } = useProjects(user?.id);

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  // Filter by status
  const filteredProjects = projects.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter,
  );

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "skills":
        return b.skill_count - a.skill_count;
      case "updates":
        return b.update_count - a.update_count;
      case "team":
        return b.team_size - a.team_size;
      case "recent":
      default:
        return new Date(b.start_date) - new Date(a.start_date);
    }
  });

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
  };

  return (
    <div className="flex h-screen bg-neutralLight">
      {/* Sidebar */}
      <Sidebar
        activeTab="portfolio"
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="px-6 pt-6">
          <Navbar
            activeTab="portfolio"
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-screen bg-neutralLight p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-dark mb-2">
                  Project Portfolio
                </h1>
                <p className="text-text-secondary text-sm">
                  Showcase your completed work and achievements
                </p>
              </div>

              {/* Loading state */}
              {loading ?
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonLoader key={i} type="chart" height={80} />
                  ))}
                </div>
              : error ?
                <div className="max-w-7xl mx-auto">
                  <ChartError onRetry={refresh} error={error} />
                </div>
              : <>
                  {/* Inline Filters */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Empty state */}
                  {sortedProjects.length === 0 ?
                    <div className="text-center py-12 bg-surface rounded-lg border border-border">
                      <p className="text-text-secondary text-lg mb-2">
                        No projects yet
                      </p>
                      <p className="text-text-secondary/70 text-sm">
                        Create your first project in CollaborationHub
                      </p>
                    </div>
                  : /* Projects Grid */
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {sortedProjects
                          .slice(0, displayCount)
                          .map((project) => (
                            <ProjectCard
                              key={project.id}
                              project={project}
                              variant="portfolio"
                              onClick={() => handleProjectClick(project)}
                            />
                          ))}
                      </div>

                      {/* Load More */}
                      {displayCount < sortedProjects.length && (
                        <div className="text-center mt-6">
                          <button
                            onClick={() => setDisplayCount((prev) => prev + 12)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                          >
                            Load{" "}
                            {Math.min(12, sortedProjects.length - displayCount)}{" "}
                            More Projects
                          </button>
                        </div>
                      )}
                    </>
                  }
                </>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={showDetailModal}
          project={selectedProject}
          onClose={handleCloseModal}
          fetchPortfolioDetails={true}
          onProjectUpdate={refresh}
        />
      )}
    </div>
  );
}
