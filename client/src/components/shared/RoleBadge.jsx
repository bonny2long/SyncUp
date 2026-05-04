import React from "react";

// iCAA brand-aligned role badge system
// Colors sourced from ICAA Branding Guide V1
const ROLE_CONFIG = {
  alumni: {
    label: "Alumni",
    // iCAA Red â€” full membership, highest tier
    bg: "bg-[#b9123f]",
    text: "text-white",
    dot: "bg-[#b9123f]",
  },
  resident: {
    // iCAA Red tinted â€” earned, on their way
    bg: "bg-[#b9123f]/15",
    text: "text-[#b9123f]",
    dot: "bg-[#b9123f]",
  },
  mentor: {
    // iCAA Gray â€” established, professional
    bg: "bg-[#383838]",
    text: "text-white",
    dot: "bg-[#383838]",
  },
  intern: {
    // Neutral â€” working toward membership
    bg: "bg-neutral-200 dark:bg-neutral-700",
    text: "text-neutral-700 dark:text-neutral-200",
    dot: "bg-neutral-500",
  },
  admin: {
    // iCAA Black â€” authority, ICAA body
    label: "iCAA",
    bg: "bg-[#282827]",
    text: "text-white",
    dot: "bg-[#282827]",
  },
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
