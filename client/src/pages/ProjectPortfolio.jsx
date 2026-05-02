import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import SkeletonLoader from "../components/shared/SkeletonLoader";
import { ChartError } from "../components/shared/ErrorBoundary";
import ProjectCard from "../components/shared/ProjectCard"; // CHANGED: Use shared component
import ProjectDetailModal from "../components/modals/ProjectDetailModal";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useProjects } from "../hooks/useProjects"; // NEW: Use shared hook
import { Award, ExternalLink, FileText, Github, Users } from "lucide-react";

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

function getCaseStudyItems(project) {
  const techStack =
    project?.case_study_tech_stack ?
      project.case_study_tech_stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    techStack,
    hasCaseStudy: Boolean(
      project?.case_study_problem ||
        project?.case_study_solution ||
        project?.case_study_outcomes ||
        techStack.length > 0,
    ),
  };
}

export default function ProjectPortfolio() {
  const { user } = useUser();

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

  const manuallyFeaturedProject = sortedProjects.find(
    (project) => Number(project.id) === Number(user?.featured_project_id),
  );
  const featuredProject =
    manuallyFeaturedProject ||
    sortedProjects.find(
      (project) =>
        project.status === "completed" && getCaseStudyItems(project).hasCaseStudy,
    ) ||
    sortedProjects.find((project) => getCaseStudyItems(project).hasCaseStudy) ||
    sortedProjects.find((project) => project.status === "completed") ||
    sortedProjects.find((project) => project.status === "active") ||
    sortedProjects[0] ||
    null;
  const featuredCaseStudy = getCaseStudyItems(featuredProject);
  const gridProjects =
    featuredProject ?
      sortedProjects.filter((project) => project.id !== featuredProject.id)
    : sortedProjects;

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
                  : /* Featured Project + Projects Grid */
                    <>
                      {featuredProject && (
                        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                                Featured Project
                              </p>
                              <h2 className="text-xl font-semibold text-primary">
                                {featuredProject.title}
                              </h2>
                              <p className="text-sm text-text-secondary mt-2 max-w-3xl">
                                {featuredProject.description ||
                                  "No description yet."}
                              </p>
                              {featuredCaseStudy.hasCaseStudy && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-w-4xl">
                                  {featuredProject.case_study_problem && (
                                    <div className="rounded-lg border border-border bg-surface-highlight p-3">
                                      <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                                        Problem
                                      </p>
                                      <p className="text-sm text-neutral-dark line-clamp-3">
                                        {featuredProject.case_study_problem}
                                      </p>
                                    </div>
                                  )}
                                  {featuredProject.case_study_solution && (
                                    <div className="rounded-lg border border-border bg-surface-highlight p-3">
                                      <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                                        Solution
                                      </p>
                                      <p className="text-sm text-neutral-dark line-clamp-3">
                                        {featuredProject.case_study_solution}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {featuredCaseStudy.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {featuredCaseStudy.techStack
                                    .slice(0, 8)
                                    .map((item) => (
                                      <span
                                        key={item}
                                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-text-secondary mt-4">
                                <span className="inline-flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {featuredProject.team_size || 0} members
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" />
                                  {featuredProject.skill_count || 0} skills
                                </span>
                                <span className="capitalize">
                                  {featuredProject.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              {featuredProject.github_url && (
                                <a
                                  href={featuredProject.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark hover:text-primary hover:border-primary/40"
                                >
                                  <Github className="w-4 h-4" />
                                  GitHub
                                </a>
                              )}
                              {featuredProject.live_url && (
                                <a
                                  href={featuredProject.live_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark hover:text-primary hover:border-primary/40"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Live
                                </a>
                              )}
                              {featuredProject.case_study_artifact_url && (
                                <a
                                  href={featuredProject.case_study_artifact_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark hover:text-primary hover:border-primary/40"
                                >
                                  <FileText className="w-4 h-4" />
                                  Artifact
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleProjectClick(featuredProject)}
                                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </section>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {gridProjects
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
                      {displayCount < gridProjects.length && (
                        <div className="text-center mt-6">
                          <button
                            onClick={() => setDisplayCount((prev) => prev + 12)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                          >
                            Load{" "}
                            {Math.min(12, gridProjects.length - displayCount)}{" "}
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
          currentUser={user}
          onClose={handleCloseModal}
          fetchPortfolioDetails={true}
          onProjectUpdate={refresh}
        />
      )}
    </div>
  );
}
