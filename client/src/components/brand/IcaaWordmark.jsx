import React from "react";

const SIZE_CLASSES = {
  xs: {
    wrap: "gap-0.5",
    mark: "h-3.5 w-3.5",
    text: "text-xl",
  },
  sm: {
    wrap: "gap-1",
    mark: "h-5 w-5",
    text: "text-3xl",
  },
  auth: {
    wrap: "gap-1",
    mark: "h-6 w-6",
    text: "text-4xl",
  },
  md: {
    wrap: "gap-1.5",
    mark: "h-8 w-8",
    text: "text-5xl",
  },
  lg: {
    wrap: "gap-2",
    mark: "h-10 w-10",
    text: "text-6xl",
  },
  sidebar: {
    wrap: "gap-1",
    mark: "h-5 w-5",
    text: "text-3xl",
  },
};

export function SixPointMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        <path d="M12 3v18" />
        <path d="M4.2 7.5l15.6 9" />
        <path d="M19.8 7.5l-15.6 9" />
      </g>
    </svg>
  );
}

export default function IcaaWordmark({
  size = "md",
  className = "",
  markClassName = "",
  textClassName = "",
}) {
  const classes = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`inline-flex items-center ${classes.wrap} leading-none ${className}`}
    >
      <SixPointMark
        className={`${classes.mark} flex-shrink-0 ${markClassName}`}
      />
      <span className={`${classes.text} font-black ${textClassName}`}>
        iCAA
      </span>
    </div>
  );
}
