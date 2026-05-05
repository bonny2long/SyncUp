import React from "react";

export default function BrandMark({ size = "md", centered = false, subtitle }) {
  const sizeClass =
    {
      sm: "text-3xl",
      md: "text-5xl",
      lg: "text-6xl",
    }[size] || "text-5xl";

  return (
    <div className={centered ? "text-center" : ""}>
      <div className={`${sizeClass} font-black text-primary leading-none`}>
        *iCAA
      </div>
      <div className="mt-1 text-2xl font-bold text-neutral-dark">SyncUp</div>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
