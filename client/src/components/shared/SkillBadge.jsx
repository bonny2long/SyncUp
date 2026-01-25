import React from "react";

/**
 * SkillBadge - Display a single skill with appropriate color
 *
 * Usage:
 * <SkillBadge skill="React" category="frontend" />
 * <SkillBadge skill="SQL" /> // Auto-detects category
 */

const SKILL_COLOR_MAP = {
  // Frontend
  react: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "html/css": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  typescript: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "vue.js": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },

  // Backend
  "node.js": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  python: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  sql: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  "api design": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  mongodb: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  "rest apis": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  express: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  graphql: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },

  // Technical
  git: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  docker: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  aws: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  testing: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  debugging: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "system design": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },

  // Soft Skills
  communication: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  leadership: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "problem solving": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "time management": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  collaboration: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  mentoring: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "critical thinking": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  adaptability: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "code review": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  documentation: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "project management": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  presentation: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

// Default color for unmapped skills
const DEFAULT_COLOR = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  border: "border-gray-200",
};

export function getSkillColor(skillName) {
  if (!skillName) return DEFAULT_COLOR;
  const normalized = skillName.toLowerCase().trim();
  return SKILL_COLOR_MAP[normalized] || DEFAULT_COLOR;
}

export default function SkillBadge({ skill, size = "sm", variant = "badge" }) {
  if (!skill) return null;

  const colors = getSkillColor(skill);
  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs"
    : size === "md" ? "px-3 py-1.5 text-sm"
    : "px-4 py-2 text-base";

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border} transition-all hover:shadow-sm`}
        title={`Skill: ${skill}`}
      >
        <span className="capitalize">{skill}</span>
      </span>
    );
  }

  if (variant === "chip") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-lg font-medium border ${colors.bg} ${colors.text} ${colors.border} transition-all hover:shadow-md`}
        title={`Skill: ${skill}`}
      >
        <span className="capitalize">{skill}</span>
      </div>
    );
  }

  return null;
}
