import React, { useState } from "react";
import BadgeCard from "./BadgeCard";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";

const categoryLabels = {
  starter: "Getting Started",
  progress: "Progress",
  collaboration: "Collaboration",
  elite: "Elite",
};

export default function BadgeGrid({ allBadges = [], earnedBadges = [] }) {
  const [expandedCategories, setExpandedCategories] = useState({
    starter: true,
    progress: true,
    collaboration: true,
    elite: true,
  });

  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));

  const categories = ["starter", "progress", "collaboration", "elite"];

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getCategoryProgress = (category) => {
    const categoryBadges = allBadges.filter((b) => b.category === category);
    const earned = categoryBadges.filter((b) => earnedIds.has(b.id)).length;
    return { earned, total: categoryBadges.length };
  };

  const totalEarned = earnedBadges.length;
  const totalBadges = allBadges.length;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Badges Earned</p>
            <p className="text-sm text-gray-500">
              {totalEarned} of {totalBadges} unlocked
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-600">
            {totalEarned}/{totalBadges}
          </p>
          <p className="text-xs text-gray-500">
            {totalBadges > 0 ? Math.round((totalEarned / totalBadges) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Category Sections */}
      {categories.map((category) => {
        const categoryBadges = allBadges.filter((b) => b.category === category);
        const { earned, total } = getCategoryProgress(category);
        const isExpanded = expandedCategories[category];

        return (
          <div key={category} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {categoryLabels[category]}
                </h3>
                <span className="text-sm text-gray-500">
                  ({earned}/{total})
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categoryBadges.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={earnedIds.has(badge.id)}
                      showDescription={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
