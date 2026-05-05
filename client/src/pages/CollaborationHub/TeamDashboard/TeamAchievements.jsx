import React, { useMemo } from "react";
import { Flame, TrendingUp, Users, Award } from "lucide-react";

const TeamAchievements = ({ data }) => {
  const achievements = useMemo(() => {
    const overview = data?.overview || {};
    const momentum = data?.momentum || [];
    const activeThisWeek = data?.activeThisWeek || [];
    const teamMembers = data?.teamMembers || [];

    const calculateStreak = () => {
      if (!momentum || momentum.length === 0) return 0;
      
      const sortedWeeks = [...momentum]
        .sort((a, b) => parseInt(b.week) - parseInt(a.week));
      
      let streak = 0;
      for (const week of sortedWeeks) {
        if (parseInt(week.signals) > 0) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const calculateGrowth = () => {
      if (!momentum || momentum.length < 2) return 0;
      
      const sortedWeeks = [...momentum]
        .sort((a, b) => parseInt(b.week) - parseInt(a.week));
      
      const thisWeek = parseInt(sortedWeeks[0]?.signals || 0);
      const lastWeek = parseInt(sortedWeeks[1]?.signals || 0);
      
      if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
      
      return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    };

    const calculateActivePercentage = () => {
      if (teamMembers.length === 0) return 0;
      return Math.round((activeThisWeek.length / teamMembers.length) * 100);
    };

    const streak = calculateStreak();
    const growth = calculateGrowth();
    const activePercentage = calculateActivePercentage();

    return [
      {
        icon: Flame,
        label: "Streak",
        value: `${streak} ${streak === 1 ? 'week' : 'weeks'}`,
        subtitle: streak >= 4 ? "On fire!" : streak >= 2 ? "Keep it up!" : "Build momentum",
        color: "orange",
        bgColor: "bg-orange-500/10",
        textColor: "text-orange-500",
        iconColor: "text-orange-500",
      },
      {
        icon: TrendingUp,
        label: "Growth",
        value: `${growth >= 0 ? '+' : ''}${growth}%`,
        subtitle: growth > 50 ? "Excellent!" : growth > 0 ? "Growing" : "Steady",
        color: "green",
        bgColor: "bg-green-500/10",
        textColor: "text-green-500",
        iconColor: "text-green-500",
      },
      {
        icon: Users,
        label: "Active",
        value: `${activePercentage}%`,
        subtitle: activePercentage === 100 ? "Perfect!" : activePercentage >= 75 ? "Great!" : "Good",
        borderColor: "border-[#b9123f]/20",
        bgColor: "bg-[#b9123f]/10",
        textColor: "text-[#b9123f]",
        iconColor: "text-[#b9123f]",
      },
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {achievements.map((achievement, index) => {
        const Icon = achievement.icon;
        return (
          <div
            key={index}
            className={`${achievement.bgColor} border ${achievement.borderColor || `border-${achievement.color}-500/20`} rounded-lg p-5 hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                <Icon className={`w-5 h-5 ${achievement.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {achievement.label}
              </span>
            </div>
            
            <div>
              <p className={`text-3xl font-bold ${achievement.textColor} mb-1`}>
                {achievement.value}
              </p>
              <p className="text-sm text-text-secondary">
                {achievement.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamAchievements;
