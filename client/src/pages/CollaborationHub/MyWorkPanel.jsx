import React from "react";
import ProjectList from "./ProjectList";

export default function MyWorkPanel({
  projects,
  selectedProject,
  setSelectedProject,
  updatesData,
  loading,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-primary mb-1">Your Projects</h2>
        <p className="text-xs text-gray-600">Projects you own or are part of</p>
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
          <p className="text-sm">No projects yet</p>
          <p className="text-xs mt-1">Create or join one to get started</p>
        </div>
      : <ProjectList
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projects={projects}
          updatesData={updatesData}
        />
      }
    </div>
  );
}
