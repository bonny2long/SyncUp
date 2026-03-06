import { useEffect, useMemo, useState, useCallback } from "react";
import { getSkillDistribution } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import SkeletonLoader from "../../components/shared/SkeletonLoader";
import { ChartError } from "../../components/shared/ErrorBoundary";
import { getErrorMessage } from "../../utils/errorHandler";

const MAX_DEFAULT = 5;

const RANK_COLORS = [
  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "text-sky-400    bg-sky-400/10    border-sky-400/20",
  "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "text-rose-400   bg-rose-400/10   border-rose-400/20",
];

const BAR_COLORS = [
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-orange-400",
  "bg-rose-400",
];

export default function SkillDistributionCards() {
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getSkillDistribution(user.id);
      setData(result);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const { visible, total, totalSignals, truncated } = useMemo(() => {
    if (!data.length) return { visible: [], total: 0, totalSignals: 0, truncated: false };

    const sorted = [...data].sort((a, b) => b.total - a.total);
    const totalSignals = sorted.reduce((sum, s) => sum + s.total, 0);
    const truncated = sorted.length > MAX_DEFAULT;
    const visible = expanded ? sorted : sorted.slice(0, MAX_DEFAULT);

    return { visible, total: sorted.length, totalSignals, truncated };
  }, [data, expanded]);

  if (loading) return <SkeletonLoader type="chart" height={180} />;
  if (error) return <ChartError onRetry={loadData} error={error} />;

  if (!visible.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-secondary">No activity yet.</p>
      </div>
    );
  }

  const topSkill = visible[0];
  const topPct = totalSignals > 0 ? Math.round((topSkill.total / totalSignals) * 100) : 0;

  return (
    <div>
      <p className="text-xs text-text-secondary mb-3">
        <span className="font-medium text-neutral-dark">{topSkill.skill}</span> is where{" "}
        <span className="font-medium text-neutral-dark">{topPct}%</span> of your recent effort went.
      </p>

      <div className="space-y-2">
        {visible.map((skill, i) => {
          const pct = totalSignals > 0 ? Math.round((skill.total / totalSignals) * 100) : 0;
          const colorClass = RANK_COLORS[i] || RANK_COLORS[RANK_COLORS.length - 1];
          const barColor = BAR_COLORS[i] || BAR_COLORS[BAR_COLORS.length - 1];

          return (
            <div
              key={skill.skill}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${colorClass}`}
            >
              <span className="text-xs font-bold w-4 shrink-0 tabular-nums">
                {i + 1}
              </span>

              <span className="text-sm font-medium text-neutral-dark flex-1 truncate">
                {skill.skill}
              </span>

              <div className="w-20 bg-border/30 rounded-full h-1.5 overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="text-sm font-bold tabular-nums w-9 text-right shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {truncated && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {expanded ? "Show less ↑" : `View all ${total} skills →`}
        </button>
      )}
    </div>
  );
}
