import React, { useMemo } from "react";
import { Trophy, Users, TrendingUp } from "lucide-react";

const TeamComparison = ({ data }) => {
  const comparisonData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(member => ({
      name: member.name,
      userId: member.user_id,
      userSignals: parseInt(member.user_signals) || 0,
      userWeight: parseInt(member.user_weight) || 0,
      avgTeamSignals: parseFloat(member.avg_team_signals) || 0,
      performance: member.avg_team_signals > 0 
        ? ((member.user_signals - member.avg_team_signals) / member.avg_team_signals * 100).toFixed(1)
        : 0
    })).sort((a, b) => b.userWeight - a.userWeight);
  }, [data]);

  const getPerformanceColor = (performance) => {
    if (performance > 20) return 'text-emerald-600 bg-emerald-50';
    if (performance < -20) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPerformanceIcon = (performance) => {
    if (performance > 20) return '🚀';
    if (performance < -20) return '📉';
    return '📊';
  };

  if (!comparisonData.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center text-gray-400 text-4xl mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-gray-600 font-medium mb-2">No Team Comparison Data</h3>
        <p className="text-gray-500 text-sm">
          Individual team member performance data will appear here once signals are generated.
        </p>
      </div>
    );
  }

  const teamAverage = comparisonData.reduce((sum, member) => sum + member.userWeight, 0) / comparisonData.length;
  const topPerformer = comparisonData[0];
  const totalTeamWeight = comparisonData.reduce((sum, member) => sum + member.userWeight, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Individual vs Team Performance</h3>
        <p className="text-sm text-gray-600">
          Compare individual team member contributions against team averages
        </p>
      </div>

      {/* Team Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{comparisonData.length}</p>
          <p className="text-xs text-blue-600">Team Members</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{totalTeamWeight}</p>
          <p className="text-xs text-green-600">Total Team Weight</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{Math.round(teamAverage)}</p>
          <p className="text-xs text-purple-600">Average Weight</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">{topPerformer?.name || "N/A"}</p>
          <p className="text-xs text-orange-600">Top Performer</p>
        </div>
      </div>

      {/* Individual Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Team Member</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Signals</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Weight</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Team Avg</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((member, index) => (
              <tr 
                key={member.userId} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index === 0 ? 'bg-emerald-50' : ''
                }`}
              >
                <td className="py-3 px-4">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <p className="text-gray-600 text-sm">
                  <strong>{topSkill.skill_name}</strong> leads with {topSkill.weight} weight contribution
                </p>
              </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {index === 0 && (
                         <p className="text-xs text-emerald-600 flex items-center">
                           <Trophy className="w-3 h-3 mr-1" />
                           Top Performer
                         </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-medium text-gray-700">{member.userSignals}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-semibold text-gray-900">{member.userWeight}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-gray-600">{Math.round(member.avgTeamSignals)}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>
                    <span className="mr-1">{getPerformanceIcon(member.performance)}</span>
                    {member.performance > 0 ? '+' : ''}{member.performance}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Team Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">💡</span>
            <p className="text-gray-600">
              <strong>{topPerformer?.name}</strong> leads with {topPerformer?.userWeight} weight contribution
            </p>
          </div>
          <div className="flex items-start">
            <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
            <p className="text-gray-600 text-sm">
              <strong>Team average performance:</strong> <strong>{Math.round(teamAverage)}</strong> weight per member
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2">🎯</span>
            <p className="text-gray-600">
              {comparisonData.filter(m => parseFloat(m.performance) > 0).length} members performing above average
            </p>
          </div>
          <div className="flex items-start">
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
            <p className="text-gray-600 text-sm">
              <strong>{teamSize}</strong> members generate <strong>{totalTeamWeight}</strong> skill weight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamComparison;