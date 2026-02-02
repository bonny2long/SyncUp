import React from "react";
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
      <div>
        <h2 className="text-lg font-bold text-primary mb-1">
          {isMentor ? "Projects You're Contributing To" : "Your Projects"}
        </h2>
        <p className="text-xs text-gray-600">
          {isMentor ?
            "Teams you're helping as a mentor"
          : "Projects you own or are part of"}
        </p>
      </div>

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-20 rounded-lg"
            />
          ))}
        </div>
      : projects.length === 0 ?
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {isMentor ?
              "Not contributing to any projects yet"
            : "No projects yet"}
          </p>
          <p className="text-xs mt-1">
            {isMentor ?
              "Browse projects and request to join teams"
            : "Create or join one to get started"}
          </p>
        </div>
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
