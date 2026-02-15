import React from "react";
import { Users, FileText, Award } from "lucide-react";

const STATUS_COLORS = {
  planned: "bg-surface-highlight text-text-secondary dark:text-gray-300",
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function ProjectCard({
  project,
  onClick,
  variant = "portfolio",
  isSelected = false,
}) {
  // Portfolio variant - COMPACT design
  if (variant === "portfolio") {
    return (
      <div
        onClick={onClick}
        className="bg-surface rounded-lg border border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer p-4"
      >
        {/* Header with status */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-neutral-dark text-sm truncate flex-1 mr-2">
            {project.title}
          </h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
              STATUS_COLORS[project.status] ||
              "bg-surface-highlight text-text-secondary"
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Compact stats in one line */}
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.team_size || 0}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {project.update_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            {project.skill_count || 0}
          </span>
        </div>
      </div>
    );
  }

  // Collaboration variant - compact, selectable
  return (
    <div
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border transition shadow-sm cursor-pointer
        ${
          isSelected ?
            "bg-secondary/20 border-secondary shadow-md"
          : "bg-surface border-border hover:shadow-lg hover:-translate-y-0.5"
        }
        transform duration-200 ease-out
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-primary text-sm">{project.title}</h3>

        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            STATUS_COLORS[project.status] ||
            "bg-surface-highlight text-text-secondary"
          }`}
        >
          {project.status}
        </span>
      </div>

      <p className="text-xs text-text-secondary mb-3 line-clamp-2">
        {truncateDescription(project.description, 80)}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
        <span>
          Team: <span className="font-medium">{project.team_count ?? 0}</span>
        </span>

        <span>
          Updates:{" "}
          <span className="font-medium">{project.update_count ?? 0}</span>
        </span>

        {project.last_update && (
          <span>
            Last:{" "}
            <span className="font-medium">
              {new Date(project.last_update).toLocaleDateString()}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
