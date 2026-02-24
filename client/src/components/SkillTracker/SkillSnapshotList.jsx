import { useEffect, useState, useMemo } from "react";
import { getSkillSummary } from "../../utils/api";
import { useUser } from "../../context/UserContext";

const MAX_DEFAULT = 6;

const TREND_CONFIG = {
  strong: {
    label: "Established",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    bar: "bg-violet-400",
  },
  growing: {
    label: "Growing",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    bar: "bg-emerald-400",
  },
  emerging: {
    label: "Emerging",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    bar: "bg-sky-400",
  },
  emerging_strength: {
    label: "Emerging",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    bar: "bg-sky-400",
  },
  stable: {
    label: "Steady",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    bar: "bg-slate-400",
  },
};

const DEFAULT_TREND = {
  label: "—",
  color: "text-slate-400",
  bg: "bg-slate-400/10",
  bar: "bg-slate-400",
};

export default function SkillSnapshotList() {
  const { user } = useUser();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getSkillSummary(user.id)
      .then((res) => setSkills(res.skills || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const { visible, maxWeight, total, truncated } = useMemo(() => {
    const sorted = [...skills].sort(
      (a, b) => (b.total_weight || 0) - (a.total_weight || 0),
    );
    const maxWeight = sorted[0]?.total_weight || 1;
    const visible = expanded ? sorted : sorted.slice(0, MAX_DEFAULT);
    return {
      visible,
      maxWeight,
      total: sorted.length,
      truncated: sorted.length > MAX_DEFAULT,
    };
  }, [skills, expanded]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-7 bg-border/40 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!skills.length) {
    return (
      <p className="text-sm text-text-secondary py-4 text-center">
        Skill insights will appear as signals accumulate.
      </p>
    );
  }

  const GRID_COLUMNS = "32px minmax(120px, 1.5fr) 2fr 48px 100px";

  return (
    <div className="w-full overflow-hidden">
      {/* Column headers */}
      <div
        className="grid gap-4 text-xs font-semibold text-text-secondary mb-3 px-2 border-b border-border/20 pb-2"
        style={{ gridTemplateColumns: GRID_COLUMNS }}
      >
        <span className="text-right">#</span>
        <span>Skill Name</span>
        <span>Strength Indicator</span>
        <span className="text-right">Pts</span>
        <span className="text-center">Trend</span>
      </div>

      <div className="space-y-0.5">
        {visible.map((skill, i) => {
          const trendKey =
            skill.trend ||
            skill.trend_label ||
            skill.trend_readiness_label ||
            skill.trend_readiness;
          const trend = TREND_CONFIG[trendKey] || DEFAULT_TREND;
          const pct = Math.max(
            4,
            Math.round(((skill.total_weight || 0) / maxWeight) * 100),
          );

          return (
            <div
              key={skill.skill_id}
              className="grid items-center gap-4 py-2 px-2 hover:bg-surface-highlight rounded-lg transition-all group"
              style={{ gridTemplateColumns: GRID_COLUMNS }}
            >
              {/* Rank */}
              <span className="text-xs text-text-secondary/60 text-right tabular-nums font-medium">
                {i + 1}
              </span>

              {/* Skill name */}
              <span className="text-sm font-semibold text-neutral-dark truncate">
                {skill.skill_name}
              </span>

              {/* Progress bar column */}
              <div className="flex items-center">
                <div className="bg-border/20 rounded-full h-2 w-full overflow-hidden">
                  <div
                    className={`h-full rounded-full shadow-sm transition-all duration-700 ease-out group-hover:brightness-110 ${trend.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Points */}
              <span className="text-xs text-text-secondary font-bold text-right tabular-nums">
                {(skill.total_weight || 0).toFixed(1)}
              </span>

              {/* Trend pill */}
              <div className="flex justify-center">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold h-6 flex items-center justify-center px-3 rounded-md text-center w-full max-w-[80px] ${trend.color} ${trend.bg}`}
                >
                  {trend.label}
                </span>
              </div>
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
