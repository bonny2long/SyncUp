import React from "react";
import { FolderKanban } from "lucide-react";
import EmptyState from "../../components/brand/EmptyState";
import ProjectList from "./ProjectList";

const MyWorkPanel = React.memo(function MyWorkPanel({
  projects,
  selectedProject,
  setSelectedProject,
  updatesData,
  loading,
  isMentor = false, // NEW PROP
  onRefresh, // NEW PROP
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="brand-card flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">My Work</p>
          <h2 className="text-lg font-black text-neutral-dark">
            {isMentor ? "Projects You're Contributing To" : "Your Projects"}
          </h2>
          <p className="text-xs text-text-secondary">
            {isMentor ?
              "Teams you're helping as a mentor"
            : "Projects you own or are part of"}
          </p>
        </div>
      </div>

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-surface-highlight"
            />
          ))}
        </div>
      : projects.length === 0 ?
        <EmptyState
          icon={FolderKanban}
          title={isMentor ? "Not contributing to any projects yet" : "No projects yet"}
          message={
            isMentor ?
              "Browse projects and request to join teams."
            : "Create or join a project to get started."
          }
        />
      : <ProjectList
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projects={projects}
          updatesData={updatesData}
          onRefresh={onRefresh}
        />
      }
    </div>
  );
});

export default MyWorkPanel;
