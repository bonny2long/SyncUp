import React from "react";

// iCAA brand-aligned role badge system
// Colors sourced from ICAA Branding Guide V1
const ROLE_CONFIG = {
  alumni: {
    label: "Alumni",
    // iCAA Red — full membership, highest tier
    bg: "bg-[#b9123f]",
    text: "text-white",
    dot: "bg-[#b9123f]",
  },
  resident: {
    // iCAA Red tinted — earned, on their way
    label: "Resident",
    bg: "bg-[#b9123f]/15",
    text: "text-[#b9123f]",
    dot: "bg-[#b9123f]",
  },
  intern: {
    // Neutral — working toward membership
    bg: "bg-neutral-200 dark:bg-neutral-700",
    text: "text-neutral-700 dark:text-neutral-200",
    dot: "bg-neutral-500",
  },
  // admin role removed — is_admin is now a flag, not a role
  // mentor role removed — mentor badge is earned, not a role
};

export default function RoleBadge({ role, size = "sm", showDot = false }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.intern;
  const sizeClasses =
    size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses} ${config.bg} ${config.text}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}
