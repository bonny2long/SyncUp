import React from "react";

export default function DiscoverProjects({
  projects,
  selectedProject,
  setSelectedProject,
  onJoinClick,
  onViewProject,
}) {
  return (
    <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;

        return (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`p-4 rounded-lg border-2 transition cursor-pointer ${
              isSelected ?
                "border-accent bg-accent/10 shadow-md"
              : "border-accent/30 bg-white hover:border-accent hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-neutralDark text-sm">
                {project.title}
              </h4>
              <span className="text-[10px] px-2 py-1 bg-accent/20 text-accent rounded-full font-medium">
                {project.status}
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {project.description}
            </p>

            <div className="flex justify-between items-center mb-3 text-xs text-gray-600">
              <div className="flex gap-3">
                <span>👥 {project.team_count ?? 0}</span>
                <span>🎯 {project.skill_count ?? 0}</span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  project.visibility === 'public' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {project.visibility === 'public' ? '🌐 Public' : '👥 Seeking'}
                </span>
              </div>
            </div>

            {/* Show different buttons based on visibility */}
            {project.visibility === 'seeking' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinClick(project);
                }}
                className="w-full px-3 py-2 bg-secondary text-white text-xs rounded-lg hover:bg-secondary/90 transition font-medium"
              >
                Join Project
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open the detail modal for viewing
                  onViewProject(project);
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition font-medium"
              >
                View Project
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
