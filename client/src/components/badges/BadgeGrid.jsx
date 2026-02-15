import React from "react";
import BadgeCard from "./BadgeCard";

export default function BadgeGrid({ allBadges = [], earnedBadges = [] }) {
  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id || b.id));

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {allBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          earned={earnedIds.has(badge.badge_id || badge.id)}
          showDescription={true}
        />
      ))}
    </div>
  );
}
