import React from "react";
import chicagoAccentImages from "./chicagoAccentImages";

export default function ChicagoAccent({
  image = "skyline",
  variant = "corner",
  className = "",
  imageClassName = "",
}) {
  const src = chicagoAccentImages[image] || chicagoAccentImages.skyline;
  const variants = {
    corner: "absolute right-0 top-0 h-40 w-64 rounded-bl-[3rem] opacity-90",
    strip: "h-24 w-full rounded-xl",
    card: "h-36 w-full rounded-xl",
    panel: "h-full min-h-[360px] w-full",
  };

  return (
    <div
      className={`pointer-events-none relative overflow-hidden border border-border bg-surface shadow-sm ${variants[variant]} ${className}`}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        loading={variant === "panel" ? "eager" : "lazy"}
        fetchPriority={variant === "panel" ? "high" : "auto"}
        decoding="async"
        className={`h-full w-full object-cover ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/80 via-primary/35 to-accent/70" />
    </div>
  );
}
