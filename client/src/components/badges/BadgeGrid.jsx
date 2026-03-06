import React from "react";
import BadgeCard from "./BadgeCard";

export default function BadgeGrid({ allBadges = [], earnedBadges = [] }) {
  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id || b.id));

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {allBadges.map((badge) => (
        <div key={badge.id} className="w-20 h-24">
          <BadgeCard
            badge={badge}
            earned={earnedIds.has(badge.badge_id || badge.id)}
            showDescription={true}
          />
        </div>
      ))}
    </div>
  );
}
