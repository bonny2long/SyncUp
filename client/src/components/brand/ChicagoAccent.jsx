import React from "react";
import skyline from "../../assets/Chicago/SkylineChicago.jpg";
import groupPhoto from "../../assets/Chicago/GroupPhoto.jpg";
import sunriseCity from "../../assets/Chicago/sunriseCity.jpg";
import skylineView from "../../assets/Chicago/skylineView.jpg";

const imageMap = {
  skyline,
  groupPhoto,
  sunriseCity,
  skylineView,
};

export default function ChicagoAccent({
  image = "skyline",
  variant = "corner",
  className = "",
  imageClassName = "",
}) {
  const src = imageMap[image] || skyline;
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
        className={`h-full w-full object-cover ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/80 via-primary/35 to-accent/70" />
    </div>
  );
}
