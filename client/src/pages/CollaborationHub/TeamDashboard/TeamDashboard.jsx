import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import { getErrorMessage } from "../../../utils/errorHandler";
import SkeletonLoader from "../../../components/shared/SkeletonLoader";
import TeamOverview from "./TeamOverview";
import TeamSkillChart from "./TeamSkillChart";
import TeamMomentumChart from "./TeamMomentumChart";
import TeamActivityFeed from "./TeamActivityFeed";
import KeyInsight from "./KeyInsight";
import { BarChart2, ChevronDown, ChevronUp } from "lucide-react";

const TeamDashboard = ({ projectId }) => {
  const { user: currentUser } = useUser();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  const loadTeamData = async () => {
    if (!projectId || !currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/projects/${projectId}/team-momentum?user_id=${currentUser.id}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Failed to load team data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [projectId, currentUser?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-20" />
          ))}
        </div>
        <SkeletonLoader className="h-48" />
        <SkeletonLoader className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-red-500 font-medium mb-2">
          Failed to load team analytics
        </h3>
        <p className="text-text-secondary text-sm">{error}</p>
        <button
          onClick={loadTeamData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-text-secondary">No team data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview - Compact Metrics */}
      <TeamOverview
        data={teamData.overview}
        teamMembers={teamData.teamMembers || []}
        activeThisWeek={teamData.activeThisWeek || []}
        signalBreakdown={teamData.signalBreakdown || []}
        skillDistribution={teamData.skillDistribution || []}
      />

      {/* Team Activity Feed - Always Visible */}
      <TeamActivityFeed projectId={projectId} />

      {/* Key Insight - Single actionable insight */}
      <KeyInsight data={teamData} />

      {/* Charts Section - Collapsible */}
      <div>
        {/* Toggle Button */}
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-highlight border border-border rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-text-secondary" />
            <span className="font-medium text-neutral-dark">
              {showCharts ? "Hide Charts" : "View Charts"}
            </span>
          </div>
          {showCharts ?
            <ChevronUp className="w-4 h-4 text-text-secondary" />
          : <ChevronDown className="w-4 h-4 text-text-secondary" />}
        </button>

        {/* Charts Content - Collapsible */}
        {showCharts && (
          <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Skill Distribution */}
              <div className="h-full">
                <TeamSkillChart data={teamData.skillDistribution} />
              </div>

              {/* Team Momentum */}
              <div className="h-full">
                <TeamMomentumChart data={teamData.momentum} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;
