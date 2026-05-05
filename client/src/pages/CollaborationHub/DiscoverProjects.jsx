import React from "react";
import { Users, Target, Globe, UserPlus } from "lucide-react";

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
              : "border-accent/30 bg-surface hover:border-accent hover:shadow-md"
            }`}
          >
            {/* Header row: title + status badge */}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-neutral-dark text-sm">
                {project.title}
              </h4>
              <span className="text-[10px] px-2 py-1 bg-accent/20 text-accent rounded-full font-medium shrink-0 ml-2">
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-text-secondary mb-3 line-clamp-2">
              {project.description}
            </p>

            {/* Footer row: meta info + compact action button */}
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{project.team_count ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{project.skill_count ?? 0}</span>
                </div>
                {project.visibility === "public" && (
                  <span className="flex items-center gap-1 text-[#b9123f]">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                )}
              </div>

              {/* Compact inline button — no full-width CTA */}
              {project.visibility === "seeking" ?
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinClick(project);
                  }}
                  className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition font-medium flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-3 h-3" />
                  Join
                </button>
              : <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProject(project);
                  }}
                  className="px-3 py-1 bg-surface-highlight text-text-secondary text-xs rounded-lg hover:bg-border transition font-medium shrink-0"
                >
                  View
                </button>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
