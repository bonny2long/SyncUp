import React from "react";
import IcaaWordmark from "./IcaaWordmark";

export default function BrandMark({ size = "md", centered = false, subtitle }) {
  return (
    <div className={centered ? "text-center" : ""}>
      <IcaaWordmark
        size={size}
        className={centered ? "justify-center text-primary" : "text-primary"}
      />
      <div className="mt-1 text-2xl font-bold text-neutral-dark">SyncUp</div>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
