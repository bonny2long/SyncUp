import React, { useMemo } from "react";
import { Trophy, TrendingUp, Award, Users } from "lucide-react";

const TopContributors = ({ data }) => {
  const topContributors = useMemo(() => {
    const activeThisWeek = data?.activeThisWeek || [];
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
    if (index === 0) return { icon: Trophy, color: "text-primary", bg: "bg-primary/10" };
    if (index === 1) return { icon: Award, color: "text-accent", bg: "bg-accent/10" };
    if (index === 2) return { icon: Award, color: "text-primary", bg: "bg-primary/10" };
    return { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" };
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
    <div className="brand-card p-6">
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
          <Trophy className="w-5 h-5 text-primary" />
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
              className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                index === 0
                  ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                : index === 1
                  ? "bg-accent/5 border-accent/20 hover:bg-accent/10"
                : index === 2
                  ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b9123f]"></span>
                    {contributor.signalCount} {contributor.signalCount === 1 ? 'update' : 'updates'}
                  </span>
                  {contributor.signalWeight > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      {contributor.signalWeight} weight
                    </span>
                  )}
                </div>
              </div>

              {contributor.growth > 0 && (
                <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">
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
            View Full Team Stats
          </button>
        </div>
      )}
    </div>
  );
};

export default TopContributors;
