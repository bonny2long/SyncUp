import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import { getErrorMessage } from "../../../utils/errorHandler";
import SkeletonLoader from "../../../components/shared/SkeletonLoader";
import TeamOverview from "./TeamOverview";
import TeamActivityFeed from "./TeamActivityFeed";
import KeyInsight from "./KeyInsight";
import TeamSkillCoverage from "./TeamSkillCoverage";
import TeamAchievements from "./TeamAchievements";
import TopContributors from "./TopContributors";

const TeamDashboard = ({ projectId }) => {
  const { user: currentUser } = useUser();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      {/* Team Activity Feed */}
      <TeamActivityFeed projectId={projectId} />

      {/* Key Insight - Single actionable insight */}
      <KeyInsight data={teamData} />

      {/* Team Achievements - 3 Cards */}
      <TeamAchievements data={teamData} />

      {/* Team Skill Coverage - Heatmap */}
      <TeamSkillCoverage data={teamData.skillDistribution || []} />

      {/* Top Contributors - Leaderboard */}
      <TopContributors data={teamData} />
    </div>
  );
};

export default TeamDashboard;
