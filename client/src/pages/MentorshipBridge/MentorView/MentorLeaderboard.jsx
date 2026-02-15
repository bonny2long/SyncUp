import { useEffect, useState } from "react";
import { fetchMentorEngagementAnalytics } from "../../../utils/api";
import { Trophy, Users, CheckCircle, Clock, Star } from "lucide-react";

export default function MentorLeaderboard() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchMentorEngagementAnalytics();
        setMentors(data || []);
      } catch (err) {
        console.error("Failed to load mentor engagement:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <p className="text-sm text-text-secondary">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <p className="text-sm text-text-secondary">No mentor data available</p>
      </div>
    );
  }

  const getResponseRate = (mentor) => {
    const total = mentor.total_sessions || 0;
    if (total === 0) return 0;
    const responded =
      (mentor.completed_sessions || 0) + (mentor.accepted_sessions || 0);
    // Cap at 100%
    const rate = Math.round((responded / total) * 100);
    return Math.min(rate, 100);
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-text-secondary" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-amber-700" />;
    return (
      <span className="text-sm font-medium text-text-secondary">
        #{index + 1}
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-neutral-dark">
          Mentor Leaderboard
        </h2>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {mentors.reduce(
              (sum, m) => sum + (Number(m.total_sessions) || 0),
              0,
            )}
          </p>
          <p className="text-xs text-blue-500">Total Sessions</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {mentors.reduce(
              (sum, m) => sum + (Number(m.completed_sessions) || 0),
              0,
            )}
          </p>
          <p className="text-xs text-green-500">Completed</p>
        </div>
        <div className="bg-amber-500/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">
            {mentors.length > 0 ?
              Math.round(
                mentors.reduce((sum, m) => sum + getResponseRate(m), 0) /
                  mentors.length,
              )
            : 0}
            %
          </p>
          <p className="text-xs text-amber-500">Avg Response</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-text-secondary border-b border-border">
              <th className="pb-3 font-medium">Rank</th>
              <th className="pb-3 font-medium">Mentor</th>
              <th className="pb-3 font-medium text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Sessions
                </div>
              </th>
              <th className="pb-3 font-medium text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </div>
              </th>
              <th className="pb-3 font-medium text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Pending
                </div>
              </th>
              <th className="pb-3 font-medium text-center">Response Rate</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor, index) => {
              const responseRate = getResponseRate(mentor);
              return (
                <tr
                  key={mentor.id}
                  className={`border-b border-border ${index < 3 ? "bg-surface-highlight/50" : ""}`}
                >
                  <td className="py-3">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {mentor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-dark">
                          {mentor.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-medium text-neutral-dark">
                      {mentor.total_sessions || 0}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-medium text-green-600">
                      {mentor.completed_sessions || 0}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-medium text-text-secondary">
                      {mentor.pending_sessions || 0}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-2 bg-surface-highlight rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            responseRate >= 80 ? "bg-green-500"
                            : responseRate >= 50 ? "bg-amber-500"
                            : "bg-red-500"
                          }`}
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                      <span className="text-xs ml-2 text-text-secondary">
                        {responseRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
