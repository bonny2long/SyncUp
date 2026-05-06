import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { getErrorMessage } from "../../../utils/errorHandler";
import SkeletonLoader from "../../../components/shared/SkeletonLoader";
import TeamOverview from "./TeamOverview";
import TeamActivityFeed from "./TeamActivityFeed";
import KeyInsight from "./KeyInsight";
import TeamSkillCoverage from "./TeamSkillCoverage";
import TeamAchievements from "./TeamAchievements";
import TopContributors from "./TopContributors";
import EmptyState from "../../../components/brand/EmptyState";
import { BarChart3 } from "lucide-react";

const TeamDashboard = ({ projectId }) => {
  const { user: currentUser } = useUser();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTeamData = useCallback(async () => {
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
  }, [currentUser?.id, projectId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

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
      <div className="brand-card border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <h3 className="mb-2 font-bold text-red-700 dark:text-red-300">
          Failed to load team analytics
        </h3>
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={loadTeamData}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!teamData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No team data available"
        description="Team analytics will appear once this project has members and skill activity."
      />
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
