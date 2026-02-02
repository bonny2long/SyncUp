import React from "react";
import { Users, FileText, Award, Zap } from "lucide-react";

const STATUS_COLORS = {
  planned: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-200 text-gray-600",
};

export default function ProjectCard({
  project,
  onClick,
  variant = "portfolio", // "portfolio" or "collaboration"
  isSelected = false,
}) {
  const formatDate = (date) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "No description";
    return text.length > maxLength ?
        `${text.substring(0, maxLength)}...`
      : text;
  };

  // Portfolio variant - cleaner, more visual
  if (variant === "portfolio") {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {project.title}
            </h3>
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                STATUS_COLORS[project.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {truncateDescription(project.description)}
        </p>

        {/* Dates */}
        <div className="text-xs text-gray-500 mb-4">
          <span>{formatDate(project.start_date)}</span>
          {project.end_date && (
            <>
              <span> → </span>
              <span>{formatDate(project.end_date)}</span>
            </>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-900">
              {project.team_size || 0}
            </p>
            <p className="text-xs text-gray-500">Team</p>
          </div>

          <div className="text-center">
            <FileText className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-900">
              {project.update_count || 0}
            </p>
            <p className="text-xs text-gray-500">Updates</p>
          </div>

          <div className="text-center">
            <Award className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-900">
              {project.skill_count || 0}
            </p>
            <p className="text-xs text-gray-500">Skills</p>
          </div>

          <div className="text-center">
            <Zap className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-900">
              {project.mentorship_count || 0}
            </p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
        </div>

        {/* Click indicator */}
        <p className="text-xs text-primary text-center mt-3 font-medium">
          Click to view details →
        </p>
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
          : "bg-white border-gray-200 hover:shadow-lg hover:-translate-y-0.5"
        }
        transform duration-200 ease-out
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-primary text-sm">{project.title}</h3>

        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {project.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {truncateDescription(project.description, 80)}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
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
