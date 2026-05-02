import React from "react";
import { Award, ExternalLink, FileText, Github, Users } from "lucide-react";

const STATUS_COLORS = {
  planned: "bg-surface-highlight text-text-secondary dark:text-gray-300",
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function truncateDescription(value, maxLength) {
  if (!value) return "No description yet.";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function hasCaseStudy(project) {
  return Boolean(
    project.case_study_problem ||
      project.case_study_solution ||
      project.case_study_tech_stack ||
      project.case_study_outcomes,
  );
}

export default function ProjectCard({
  project,
  onClick,
  variant = "portfolio",
  isSelected = false,
}) {
  const ProjectLinks = ({ compact = false }) => {
    const links = [
      {
        href: project.github_url,
        label: "GitHub",
        icon: Github,
      },
      {
        href: project.live_url,
        label: "Live",
        icon: ExternalLink,
      },
      {
        href: project.case_study_artifact_url,
        label: "Artifact",
        icon: FileText,
      },
    ].filter((link) => link.href);

    if (links.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : "mt-2"}`}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className={`inline-flex items-center gap-1 rounded-md border border-border bg-surface-highlight text-text-secondary hover:text-primary hover:border-primary/30 transition ${
              compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
            }`}
          >
            {React.createElement(link.icon, { className: "w-3 h-3" })}
            {link.label}
          </a>
        ))}
      </div>
    );
  };

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

        {hasCaseStudy(project) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary mb-2">
            <FileText className="w-3 h-3" />
            Case study
          </span>
        )}

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

        <ProjectLinks compact />
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

      {hasCaseStudy(project) && (
        <p className="text-[11px] font-medium text-primary mb-2">
          Case study ready
        </p>
      )}

      <ProjectLinks />

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
