import { useEffect, useMemo, useState, useCallback } from "react";
import { AgCharts } from "ag-charts-react";
import { getSkillDistribution } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import SkeletonLoader from "../../components/shared/SkeletonLoader";
import { ChartError } from "../../components/shared/ErrorBoundary";
import { getErrorMessage } from "../../utils/errorHandler";
import { useChartTheme } from "./useChartTheme";

const MAX_VISIBLE_SKILLS = 10;

const SKILL_COLORS = {
  react: "#4f46e5",
  "node.js": "#16a34a",
  sql: "#dc2626",
  "api design": "#ea580c",
  "system design": "#0f766e",
  communication: "#7c3aed",
  debugging: "#0891b2",
  python: "#f59e0b",
  git: "#10b981",
};

const OTHERS_COLOR = "#94a3b8";

export default function SkillDistributionChart() {
  const { user } = useUser();
  const chartTheme = useChartTheme();
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
      console.error("Skill fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { chartData, insight, totalSkills, hasOthers } = useMemo(() => {
    if (!data.length) {
      return { chartData: [], insight: null, totalSkills: 0, hasOthers: false };
    }

    // Sort by total descending (API already does this, but ensure it)
    const sorted = [...data].sort((a, b) => b.total - a.total);
    const totalSignals = sorted.reduce((sum, s) => sum + s.total, 0);

    // Build insight from top skill
    const topEntry = sorted[0];
    const insight =
      topEntry && totalSignals > 0 ?
        topEntry.total / totalSignals > 0.25 ?
          `${topEntry.skill} represents ${Math.round(
            (topEntry.total / totalSignals) * 100,
          )}% of recent activity.`
        : "Your activity is evenly distributed across skills."
      : null;

    const needsTruncation = sorted.length > MAX_VISIBLE_SKILLS;

    if (!expanded && needsTruncation) {
      // Show top N + "Others" aggregate
      const topSkills = sorted.slice(0, MAX_VISIBLE_SKILLS);
      const remaining = sorted.slice(MAX_VISIBLE_SKILLS);
      const othersTotal = remaining.reduce((sum, s) => sum + s.total, 0);
      const othersCount = remaining.length;

      const chartData = [
        ...topSkills,
        {
          skill: `Others (${othersCount} skills)`,
          total: othersTotal,
          isOthers: true,
        },
      ];

      return {
        chartData,
        insight,
        totalSkills: sorted.length,
        hasOthers: true,
      };
    }

    return {
      chartData: sorted,
      insight,
      totalSkills: sorted.length,
      hasOthers: needsTruncation,
    };
  }, [data, expanded]);

  if (loading) {
    return <SkeletonLoader type="chart" height={260} />;
  }

  if (error) {
    return <ChartError onRetry={loadData} error={error} />;
  }

  if (!chartData.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">No activity yet.</p>
        <p className="text-xs text-text-secondary mt-2">
          This updates automatically as you work.
        </p>
      </div>
    );
  }

  // Dynamic height: fixed when collapsed, scales when expanded
  const chartHeight =
    expanded ? Math.max(260, chartData.length * 28 + 40) : 260;

  const chartOptions = {
    data: chartData,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "skill",
        yKey: "total",
        cornerRadius: 4,
        itemStyler: ({ datum }) => ({
          fill:
            datum.isOthers ? OTHERS_COLOR : (
              SKILL_COLORS[datum.skill.toLowerCase()] || "#64748b"
            ),
          fillOpacity: datum.isOthers ? 0.7 : 1,
        }),
        tooltip: {
          renderer: ({ datum }) => ({
            title: datum.skill,
            data: [{ label: "Signals", value: datum.total }],
          }),
        },
      },
    ],
    axes: {
      number: {
        position: "bottom",
        nice: true,
        label: { fontSize: 11, color: chartTheme.axisLabelColor },
      },
      category: {
        position: "left",
        label: { fontSize: 12, color: chartTheme.axisLabelColor },
      },
    },
    padding: { left: 20, right: 20, top: 10, bottom: 10 },
    background: { fill: "transparent" },
  };

  return (
    <div className="w-full">
      {insight && <p className="text-xs text-text-secondary mb-2">{insight}</p>}
      <div style={{ height: chartHeight, transition: "height 0.3s ease" }}>
        <AgCharts options={chartOptions} />
      </div>
      {/* Show expand/collapse toggle when there are more skills than the limit */}
      {(hasOthers || expanded) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
        >
          {expanded ? "Show Less ↑" : `View All ${totalSkills} Skills →`}
        </button>
      )}
    </div>
  );
}
