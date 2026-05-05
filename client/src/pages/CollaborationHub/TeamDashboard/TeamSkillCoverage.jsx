import React, { useMemo } from "react";
import { Target, TrendingUp, Award } from "lucide-react";

const TeamSkillCoverage = ({ data = [] }) => {
  const skillCoverage = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const skillMap = {};

    data.forEach((item) => {
      if (!item.skill_name) return;

      if (!skillMap[item.skill_name]) {
        skillMap[item.skill_name] = {
          skill: item.skill_name,
          users: new Set(),
          totalWeight: 0,
          totalSignals: 0,
        };
      }

      if (item.user_id) {
        skillMap[item.skill_name].users.add(item.user_id);
      }
      skillMap[item.skill_name].totalWeight += item.total_weight || 0;
      skillMap[item.skill_name].totalSignals += item.signal_count || 0;
    });

    const allUsers = new Set();
    data.forEach((item) => {
      if (item.user_id) allUsers.add(item.user_id);
    });
    const teamSize = allUsers.size || 1;

    return Object.values(skillMap)
      .map((skill) => ({
        ...skill,
        userCount: skill.users.size,
        coverage: (skill.users.size / teamSize) * 100,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10);
  }, [data]);

  const getCoverageLevel = (coverage) => {
    if (coverage >= 80) return { label: "Expert", color: "bg-green-500", textColor: "text-green-500" };
    if (coverage >= 50) return { label: "Good", color: "bg-[#b9123f]", textColor: "text-[#b9123f]" };
    if (coverage >= 20) return { label: "Learning", color: "bg-orange-500", textColor: "text-orange-500" };
    return { label: "Beginner", color: "bg-gray-400", textColor: "text-gray-400" };
  };

  const averageCoverage = useMemo(() => {
    if (skillCoverage.length === 0) return 0;
    const sum = skillCoverage.reduce((acc, skill) => acc + skill.coverage, 0);
    return Math.round(sum / skillCoverage.length);
  }, [skillCoverage]);

  const getCoverageScore = () => {
    if (averageCoverage >= 80) return { text: "Excellent!", color: "text-green-500", icon: Award };
    if (averageCoverage >= 60) return { text: "Good", color: "text-[#b9123f]", icon: TrendingUp };
    if (averageCoverage >= 40) return { text: "Fair", color: "text-orange-500", icon: Target };
    return { text: "Growing", color: "text-gray-500", icon: Target };
  };

  if (skillCoverage.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-surface-highlight">
          <Target className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-neutral-dark font-semibold text-lg mb-2">
          No Skill Coverage Data
        </h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Team members need to add skill tags to their updates to see coverage data here.
        </p>
      </div>
    );
  }

  const scoreInfo = getCoverageScore();
  const ScoreIcon = scoreInfo.icon;

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-dark mb-1">
            Team Skill Coverage
          </h3>
          <p className="text-sm text-text-secondary">
            Skills practiced across your team
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <ScoreIcon className={`w-5 h-5 ${scoreInfo.color}`} />
            <span className={`text-2xl font-bold ${scoreInfo.color}`}>
              {averageCoverage}%
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Coverage Score: {scoreInfo.text}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {skillCoverage.map((skill) => {
          const level = getCoverageLevel(skill.coverage);
          return (
            <div
              key={skill.skill}
              className="group hover:bg-surface-highlight p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium text-neutral-dark min-w-[120px]">
                    {skill.skill}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.textColor} bg-opacity-10`}
                    style={{ backgroundColor: `${level.color}20` }}>
                    {level.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-text-secondary">
                    {skill.userCount}/{skill.userCount} ({Math.round(skill.coverage)}%)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-surface-highlight rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${level.color} transition-all duration-500 ease-out`}
                  style={{ width: `${skill.coverage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">
            {skillCoverage.length}
          </p>
          <p className="text-xs text-text-secondary mt-1">Skills Tracked</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">
            {skillCoverage.filter(s => s.coverage >= 80).length}
          </p>
          <p className="text-xs text-text-secondary mt-1">Expert Level</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-500">
            {skillCoverage.filter(s => s.coverage < 50).length}
          </p>
          <p className="text-xs text-text-secondary mt-1">Needs Growth</p>
        </div>
      </div>
    </div>
  );
};

export default TeamSkillCoverage;
