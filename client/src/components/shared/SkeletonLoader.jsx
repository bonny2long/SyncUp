import React from "react";

/**
 * SkeletonLoader - Animated skeleton for loading states
 *
 * Usage:
 * <SkeletonLoader type="chart" height={280} />
 * <SkeletonLoader type="bar" count={5} />
 * <SkeletonLoader type="text" lines={3} />
 */
export default function SkeletonLoader({
  type = "chart",
  height = 280,
  count = 1,
  lines = 3,
}) {
  if (type === "chart") {
    return (
      <div
        style={{ height }}
        className="w-full bg-gray-100 rounded-lg animate-shimmer"
      />
    );
  }

  if (type === "bar") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="h-8 flex-1 bg-gray-100 rounded animate-shimmer" />
            <div className="h-8 w-12 bg-gray-100 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-100 rounded animate-shimmer"
            style={{
              width: i === lines - 1 ? "80%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
