import React from "react";

export default function ProjectCard({
  project,
  selectedProject,
  setSelectedProject,
  onOpenModal,
}) {
  const isActive = selectedProject === project.id;

  const statusColors = {
    planned: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-red-100 text-red-600",
  };

  return (
    <div
      onClick={() => setSelectedProject(isActive ? null : project.id)}
      onDoubleClick={() => onOpenModal(project)}
      className={`
        w-full text-left p-4 rounded-xl border transition shadow-sm cursor-pointer
        ${
          isActive
            ? "bg-secondary/20 border-secondary shadow-md"
            : "bg-white border-gray-200 hover:shadow-lg hover:-translate-y-0.5"
        }
        transform duration-200 ease-out
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-primary text-sm">{project.title}</h3>

        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            statusColors[project.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {project.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3">{project.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span>
          Team: <span className="font-medium">{project.team_count ?? 0}</span>
        </span>

        <span>
          Updates: {" "}
          <span className="font-medium">{project.update_count ?? 0}</span>
        </span>

        {project.last_update && (
          <span>
            Last: {" "}
            <span className="font-medium">
              {new Date(project.last_update).toLocaleDateString()}
            </span>
          </span>
        )}
      </div>

      {project.team_members && (
        <div className="flex flex-wrap gap-2 mt-2">
          {project.team_members
            .split(", ")
            .filter(Boolean)
            .slice(0, 4)
            .map((name) => (
              <span
                key={name}
                className="text-[10px] px-2 py-1 rounded-full bg-neutral-light border border-gray-100 text-neutral-dark"
              >
                {name}
              </span>
            ))}

          {project.team_members.split(", ").filter(Boolean).length > 4 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-neutral-light border border-gray-100 text-neutral-dark">
              +{project.team_members.split(", ").filter(Boolean).length - 4} more
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(project);
        }}
        className="mt-3 text-xs px-3 py-1 rounded-lg bg-primary text-white hover:bg-secondary transition"
      >
        View Details
      </button>
    </div>
  );
}
