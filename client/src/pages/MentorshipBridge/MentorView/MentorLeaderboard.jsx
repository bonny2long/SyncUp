import { useEffect, useState } from "react";
import { fetchMentorEngagementAnalytics } from "../../../utils/api";
import { Trophy, Users, CheckCircle, Clock, Star } from "lucide-react";
import EmptyState from "../../../components/brand/EmptyState";

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
      <div className="brand-card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-card border-red-200 p-6">
        <p className="text-sm font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No mentor data available"
        message="Mentor activity will appear here after sessions are requested and completed."
      />
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
    <div className="brand-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Mentor Credibility</p>
          <h2 className="text-lg font-black text-neutral-dark">
            Mentor Leaderboard
          </h2>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-primary/5 p-4 text-center">
          <p className="text-2xl font-black text-primary">
            {mentors.reduce(
              (sum, m) => sum + (Number(m.total_sessions) || 0),
              0,
            )}
          </p>
          <p className="text-xs font-bold uppercase text-text-secondary">Total Sessions</p>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-4 text-center">
          <p className="text-2xl font-black text-primary">
            {mentors.reduce(
              (sum, m) => sum + (Number(m.completed_sessions) || 0),
              0,
            )}
          </p>
          <p className="text-xs font-bold uppercase text-text-secondary">Completed</p>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-4 text-center">
          <p className="text-2xl font-black text-primary">
            {mentors.length > 0 ?
              Math.round(
                mentors.reduce((sum, m) => sum + getResponseRate(m), 0) /
                  mentors.length,
              )
            : 0}
            %
          </p>
          <p className="text-xs font-bold uppercase text-text-secondary">Avg Response</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-text-secondary">
              <th className="pb-3 font-black">Rank</th>
              <th className="pb-3 font-black">Mentor</th>
              <th className="pb-3 text-center font-black">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Sessions
                </div>
              </th>
              <th className="pb-3 text-center font-black">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </div>
              </th>
              <th className="pb-3 text-center font-black">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Pending
                </div>
              </th>
              <th className="pb-3 text-center font-black">Response Rate</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor, index) => {
              const responseRate = getResponseRate(mentor);
              return (
                <tr
                  key={mentor.id}
                  className={`border-b border-border ${index < 3 ? "bg-primary/5" : ""}`}
                >
                  <td className="py-3">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <span className="text-sm font-black text-primary">
                          {mentor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-neutral-dark">
                          {mentor.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-bold text-neutral-dark">
                      {mentor.total_sessions || 0}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-bold text-primary">
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
                        <div className="h-full rounded-full bg-primary" style={{ width: `${responseRate}%` }} />
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
