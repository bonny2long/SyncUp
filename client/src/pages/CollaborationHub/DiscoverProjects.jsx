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
    <div className="max-h-[650px] space-y-3 overflow-y-auto pr-2">
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;

        return (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`brand-card brand-card-hover cursor-pointer p-4 transition ${
              isSelected ?
                "border-primary bg-primary/10 shadow-md"
              : "hover:border-primary/30"
            }`}
          >
            {/* Header row: title + status badge */}
            <div className="mb-2 flex items-start justify-between">
              <h4 className="text-sm font-black text-neutral-dark">
                {project.title}
              </h4>
              <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold capitalize text-primary">
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-text-secondary mb-3 line-clamp-2">
              {project.description}
            </p>

            {/* Footer row: meta info + compact action button */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-3">
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
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white transition hover:bg-primary/90"
                >
                  <UserPlus className="w-3 h-3" />
                  Join
                </button>
              : <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProject(project);
                  }}
                  className="shrink-0 rounded-lg bg-surface-highlight px-3 py-1 text-xs font-bold text-text-secondary transition hover:bg-border"
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
