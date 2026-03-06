import React, { useMemo } from "react";
import { Trophy, TrendingUp, Award, Users } from "lucide-react";

const TopContributors = ({ data }) => {
  const topContributors = useMemo(() => {
    const activeThisWeek = data?.activeThisWeek || [];
    const teamMembers = data?.teamMembers || [];
    const momentum = data?.momentum || [];

    if (activeThisWeek.length === 0) return [];

    const currentWeekData = momentum.length > 0 ? momentum[momentum.length - 1] : null;
    const previousWeekData = momentum.length > 1 ? momentum[momentum.length - 2] : null;

    const ranked = activeThisWeek
      .map((user) => {
        const signalCount = parseInt(user.signal_count) || 0;
        const signalWeight = parseInt(user.signal_weight) || 0;
        
        const growth = previousWeekData && currentWeekData
          ? Math.round(
              ((parseInt(currentWeekData.signals) - parseInt(previousWeekData.signals)) /
                (parseInt(previousWeekData.signals) || 1)) * 100
            )
          : 0;

        return {
          ...user,
          signalCount,
          signalWeight,
          growth: signalCount > 0 ? Math.abs(growth) : 0,
        };
      })
      .sort((a, b) => {
        if (b.signalCount !== a.signalCount) {
          return b.signalCount - a.signalCount;
        }
        return b.signalWeight - a.signalWeight;
      })
      .slice(0, 5);

    return ranked;
  }, [data]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalIcon = (index) => {
    if (index === 0) return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" };
    if (index === 1) return { icon: Award, color: "text-gray-400", bg: "bg-gray-400/10" };
    if (index === 2) return { icon: Award, color: "text-orange-600", bg: "bg-orange-600/10" };
    return { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" };
  };

  if (topContributors.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-surface-highlight">
          <Users className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-neutral-dark font-semibold text-lg mb-2">
          No Activity This Week
        </h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Team member activity will be ranked here once updates start coming in.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-dark mb-1">
            Top Contributors This Week
          </h3>
          <p className="text-sm text-text-secondary">
            Ranked by activity and signal strength
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-xs font-medium text-text-secondary">
            {topContributors.length} active
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {topContributors.map((contributor, index) => {
          const medal = getMedalIcon(index);
          const MedalIcon = medal.icon;

          return (
            <div
              key={contributor.id}
              className={`group flex items-center gap-4 p-4 rounded-lg border transition-all ${
                index === 0
                  ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10"
                  : index === 1
                  ? "bg-gray-400/5 border-gray-400/20 hover:bg-gray-400/10"
                  : index === 2
                  ? "bg-orange-600/5 border-orange-600/20 hover:bg-orange-600/10"
                  : "bg-surface-highlight border-border hover:bg-border/50"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${medal.bg}`}>
                <MedalIcon className={`w-5 h-5 ${medal.color}`} />
              </div>

              <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-full text-primary font-bold text-sm flex-shrink-0">
                {getInitials(contributor.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-neutral-dark truncate">
                    {contributor.name}
                  </p>
                  {contributor.role && (
                    <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {contributor.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {contributor.signalCount} {contributor.signalCount === 1 ? 'update' : 'updates'}
                  </span>
                  {contributor.signalWeight > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {contributor.signalWeight} weight
                    </span>
                  )}
                </div>
              </div>

              {contributor.growth > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-semibold text-green-500">
                    +{contributor.growth}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {topContributors.length >= 5 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View Full Team Stats →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopContributors;
