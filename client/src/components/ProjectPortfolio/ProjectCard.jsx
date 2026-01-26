import React from "react";
import { Users, FileText, Award, Zap } from "lucide-react";

const STATUS_COLORS = {
  planned: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-200 text-gray-600",
};

export default function ProjectCard({ project, onClick }) {
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer p-5"
    >
      {/* Header with status */}
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

      {/* Skills */}
      {project.skill_count > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-700 font-medium mb-1">
            {project.skill_count} skill{project.skill_count !== 1 ? "s" : ""}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{
                width: `${Math.min((project.skill_count / 10) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

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
