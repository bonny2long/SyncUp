import React, { useMemo } from "react";
import { Flame, TrendingUp, Users } from "lucide-react";

const TeamAchievements = ({ data }) => {
  const achievements = useMemo(() => {
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
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20",
        textColor: "text-primary",
        iconColor: "text-primary",
      },
      {
        icon: TrendingUp,
        label: "Growth",
        value: `${growth >= 0 ? '+' : ''}${growth}%`,
        subtitle: growth > 50 ? "Excellent!" : growth > 0 ? "Growing" : "Steady",
        bgColor: "bg-accent/10",
        borderColor: "border-accent/20",
        textColor: "text-accent",
        iconColor: "text-accent",
      },
      {
        icon: Users,
        label: "Active",
        value: `${activePercentage}%`,
        subtitle: activePercentage === 100 ? "Perfect!" : activePercentage >= 75 ? "Great!" : "Good",
        borderColor: "border-primary/20",
        bgColor: "bg-primary/10",
        textColor: "text-primary",
        iconColor: "text-primary",
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
            className={`${achievement.bgColor} border ${achievement.borderColor} rounded-xl p-5 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                <Icon className={`w-5 h-5 ${achievement.iconColor}`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {achievement.label}
              </span>
            </div>
            
            <div>
              <p className={`mb-1 text-3xl font-black ${achievement.textColor}`}>
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
