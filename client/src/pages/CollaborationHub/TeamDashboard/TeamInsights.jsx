import React, { useMemo } from "react";

const TeamInsights = ({ data, projectId }) => {
  const insights = useMemo(() => {
    if (!data) return [];

    const generatedInsights = [];

    // Growth Rate Insights
    if (data.momentum && data.momentum.length > 1) {
      const recentWeek = data.momentum[data.momentum.length - 1];
      const previousWeek = data.momentum[data.momentum.length - 2];
      const growthRate = previousWeek.signals > 0 
        ? ((recentWeek.signals - previousWeek.signals) / previousWeek.signals * 100)
        : 0;

      if (growthRate > 30) {
        generatedInsights.push({
          type: 'high_growth',
          icon: '🚀',
          title: 'Exceptional Growth Detected',
          description: `Team skill signals increased by ${growthRate.toFixed(0)}% this week!`,
          recommendation: 'Keep up the momentum. Consider documenting best practices.',
          priority: 'high'
        });
      } else if (growthRate > 10) {
        generatedInsights.push({
          type: 'moderate_growth',
          icon: '📈',
          title: 'Steady Progress',
          description: `Team shows healthy ${growthRate.toFixed(0)}% growth in skill signals.`,
          recommendation: 'Continue current collaboration patterns and skill development.',
          priority: 'medium'
        });
      } else if (growthRate < -10) {
        generatedInsights.push({
          type: 'decline',
          icon: '📉',
          title: 'Activity Decline',
          description: `Team activity decreased by ${Math.abs(growthRate).toFixed(0)}% this week.`,
          recommendation: 'Check team workload and remove any blockers to progress.',
          priority: 'high'
        });
      }
    }

    // Skill Distribution Insights
    if (data.skillDistribution && data.skillDistribution.length > 0) {
      const skillTotals = {};
      data.skillDistribution.forEach(item => {
        if (!skillTotals[item.skill_name]) {
          skillTotals[item.skill_name] = { weight: 0, users: new Set() };
        }
        skillTotals[item.skill_name].weight += item.total_weight || 0;
        if (item.signal_count > 0) {
          skillTotals[item.skill_name].users.add(item.user_id);
        }
      });

      const topSkills = Object.entries(skillTotals)
        .sort(([,a], [,b]) => b.weight - a.weight)
        .slice(0, 3);

      const topSkill = topSkills[0];
      if (topSkill && topSkill[1].weight > 10) {
        generatedInsights.push({
          type: 'skill_strength',
          icon: '💪',
          title: 'Team Strength Identified',
          description: `Team excels in ${topSkill[0]} with ${topSkill[1].weight} total weight.`,
          recommendation: `Leverage this strength in project planning and mentorship.`,
          priority: 'medium'
        });
      }

      // Check for skill diversity
      const uniqueSkills = Object.keys(skillTotals).length;
      const teamSize = data.overview?.team_size || 1;
      const skillsPerMember = uniqueSkills / teamSize;

      if (skillsPerMember < 2) {
        generatedInsights.push({
          type: 'low_diversity',
          icon: '🎯',
          title: 'Expand Skill Coverage',
          description: `Team has low skill diversity with ${uniqueSkills} skills across ${teamSize} members.`,
          recommendation: 'Encourage team members to explore new technologies and share knowledge.',
          priority: 'medium'
        });
      }
    }

    // Team Activity Insights
    if (data.overview) {
      const activeRate = data.overview.active_this_week / data.overview.team_size;
      if (activeRate > 0.8) {
        generatedInsights.push({
          type: 'high_engagement',
          icon: '🔥',
          title: 'High Team Engagement',
          description: `${Math.round(activeRate * 100)}% of team members were active this week.`,
          recommendation: 'Excellent engagement! Consider recognizing active contributors.',
          priority: 'low'
        });
      } else if (activeRate < 0.3) {
        generatedInsights.push({
          type: 'low_engagement',
          icon: '⚠️',
          title: 'Low Team Activity',
          description: `Only ${Math.round(activeRate * 100)}% of team members active this week.`,
          recommendation: 'Check in with team members and identify any blockers.',
          priority: 'high'
        });
      }
    }

    // Individual Performance Insights
    if (data.individualComparison && data.individualComparison.length > 0) {
      const topPerformer = data.individualComparison[0];
      const avgWeight = data.individualComparison.reduce((sum, member) => sum + (member.user_weight || 0), 0) / data.individualComparison.length;

      if (topPerformer.user_weight > avgWeight * 2) {
        generatedInsights.push({
          type: 'star_performer',
          icon: '⭐',
          title: 'Rising Star Detected',
          description: `${topPerformer.name} is performing exceptionally well with ${topPerformer.user_weight} weight.`,
          recommendation: 'Consider leadership opportunities and knowledge sharing sessions.',
          priority: 'medium'
        });
      }
    }

    return generatedInsights.slice(0, 5); // Limit to top 5 insights
  }, [data]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!insights.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">🤖</div>
        <h3 className="text-gray-600 font-medium mb-2">No Insights Available</h3>
        <p className="text-gray-500 text-sm">
          AI-powered insights will appear here once there's enough team activity data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Team Insights</h3>
        <p className="text-sm text-gray-600">
          Actionable recommendations based on team performance and activity patterns
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`border-l-4 rounded-lg p-4 ${getPriorityColor(insight.priority)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="text-2xl mr-3">{insight.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900 mr-2">{insight.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                  <div className="bg-white bg-opacity-60 rounded p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">💡 Recommendation:</p>
                    <p className="text-sm text-gray-700">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">🤖</span>
          <h4 className="font-medium text-blue-900">About AI Insights</h4>
        </div>
        <p className="text-sm text-blue-700">
          These insights are generated based on your team's activity patterns, skill growth trends, and performance metrics. 
          They update automatically as your team generates more signals and engages in projects.
        </p>
      </div>
    </div>
  );
};

export default TeamInsights;