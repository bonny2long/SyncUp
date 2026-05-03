import React from "react";

const POSITION_CONFIG = {
  president: {
    label: "President",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  vice_president: {
    label: "Vice President",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  treasurer: {
    label: "Treasurer",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  },
  secretary: {
    label: "Secretary",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  },
  parliamentarian: {
    label: "Parliamentarian",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300",
  },
  tech_lead: {
    label: "Tech Lead",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300",
  },
  tech_member: {
    label: "Tech Member",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300",
  },
};

export default function GovernanceBadge({ position, size = "sm" }) {
  const config = POSITION_CONFIG[position];
  if (!config) return null;

  const sizeClass =
    size === "xs" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
