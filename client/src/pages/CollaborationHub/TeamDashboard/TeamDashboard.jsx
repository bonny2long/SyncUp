import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import { getErrorMessage } from "../../../utils/errorHandler";
import SkeletonLoader from "../../../components/shared/SkeletonLoader";
import TeamOverview from "./TeamOverview";
import TeamSkillChart from "./TeamSkillChart";
import TeamMomentumChart from "./TeamMomentumChart";
import TeamComparison from "./TeamComparison";
import TeamInsights from "./TeamInsights";

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
        `/api/projects/${projectId}/team-momentum?user_id=${currentUser.id}`
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-24" />
          ))}
        </div>
        <SkeletonLoader className="h-64" />
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Failed to load team analytics</h3>
        <p className="text-red-600 text-sm">{error}</p>
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No team data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <TeamOverview data={teamData.overview} />
      
      {/* Team Skill Distribution */}
      <TeamSkillChart data={teamData.skillDistribution} />
      
      {/* Team Momentum */}
      <TeamMomentumChart data={teamData.momentum} />
      
      {/* Individual vs Team Comparison */}
      <TeamComparison data={teamData.individualComparison} />
      
      {/* AI-Powered Insights */}
      <TeamInsights 
        data={teamData} 
        projectId={projectId}
      />
    </div>
  );
};

export default TeamDashboard;