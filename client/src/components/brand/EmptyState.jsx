import React from "react";
import ChicagoAccent from "./ChicagoAccent";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  image,
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-sm">
      {image && (
        <div className="absolute inset-x-0 top-0 h-20 opacity-20">
          <ChicagoAccent image={image} variant="strip" className="h-full rounded-none border-0 shadow-none" />
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-neutral-dark">{title}</h3>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
