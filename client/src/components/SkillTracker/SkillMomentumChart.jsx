import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { getSkillMomentum } from "../../utils/api";
import { weekLabelFromYearWeek } from "../../utils/date";
import { useUser } from "../../context/UserContext";
import SkeletonLoader from "../../components/shared/SkeletonLoader";
import { ChartError } from "../../components/shared/ErrorBoundary";
import { getErrorMessage } from "../../utils/errorHandler";

const COLORS = {
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

export default function SkillMomentumChart() {
  const { user } = useUser();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSkillMomentum(user.id);
      setRawData(data);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Failed to load skill momentum:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const { chartData, skills, skillKeys, insights } = useMemo(() => {
    if (!rawData.length) {
      return { chartData: [], skills: [], skillKeys: {}, insights: [] };
    }

    const weeks = Array.from(new Set(rawData.map((r) => r.year_week))).sort(
      (a, b) => a - b,
    );

    const skillWeekMap = {};
    const totals = {};

    rawData.forEach((r) => {
      const val = Number(r.signal_count);
      skillWeekMap[r.skill_name] ??= {};
      skillWeekMap[r.skill_name][r.year_week] = val;
      totals[r.skill_name] = (totals[r.skill_name] || 0) + val;
    });

    const topSkills = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    const skillKeys = Object.fromEntries(
      topSkills.map((skill) => [skill, skill.replace(/[^a-zA-Z0-9]/g, "_")]),
    );

    const rows = weeks.map((week, idx) => {
      const label = weekLabelFromYearWeek(week);
      const row = { week: label };
      const prevWeek = weeks[idx - 1];

      topSkills.forEach((skill) => {
        const current = skillWeekMap[skill]?.[week] || 0;
        const previous = prevWeek ? skillWeekMap[skill]?.[prevWeek] || 0 : 0;
        row[skillKeys[skill]] = current - previous;
      });

      return row;
    });

    const insights =
      weeks.length < 2 || !topSkills.length ?
        []
      : (() => {
          const lastWeek = weeks[weeks.length - 1];
          const prevWeek = weeks[weeks.length - 2];

          const deltas = topSkills.map((skill) => ({
            skill,
            delta:
              (skillWeekMap[skill]?.[lastWeek] || 0) -
              (skillWeekMap[skill]?.[prevWeek] || 0),
          }));

          const positive = deltas
            .filter((d) => d.delta > 0)
            .sort((a, b) => b.delta - a.delta);
          const negative = deltas
            .filter((d) => d.delta < 0)
            .sort((a, b) => a.delta - b.delta);

          if (deltas.every((d) => d.delta === 0)) {
            return ["Your activity remained steady across skills this week."];
          }
          if (positive[0] && negative[0]) {
            return [
              `${positive[0].skill} saw the biggest increase, while ${negative[0].skill} slowed slightly.`,
            ];
          }
          if (positive[0]) {
            return [`${positive[0].skill} increased compared to last week.`];
          }
          return [];
        })();

    return { chartData: rows, skills: topSkills, skillKeys, insights };
  }, [rawData]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <SkeletonLoader type="chart" height={280} />
      </div>
    );
  }

  // Error state
  if (error) {
    return <ChartError onRetry={loadData} error={error} />;
  }

  // Empty state
  if (!chartData.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No momentum data available yet.</p>
        <p className="text-xs text-gray-400 mt-2">
          Data needs at least 2 weeks of activity to show trends.
        </p>
      </div>
    );
  }

  const options = {
    data: chartData,
    series: skills.map((skill) => {
      const color = COLORS[skill.toLowerCase()] || "#6b7280";
      return {
        type: "area",
        xKey: "week",
        yKey: skillKeys[skill],
        yName: skill,
        stacked: true,
        fill: color,
        fillOpacity: 0.55,
        stroke: color,
        strokeWidth: 1.5,
      };
    }),
    axes: {
      x: {
        type: "category",
        position: "bottom",
        label: { fontSize: 12, wrapping: "on-space" },
      },
      y: {
        type: "number",
        position: "left",
        nice: true,
        label: { fontSize: 11 },
      },
    },
    padding: { top: 12, right: 48, bottom: 16, left: 18 },
    legend: { position: "bottom" },
    background: { fill: "transparent" },
  };

  return (
    <div className="w-full">
      {insights.length > 0 && (
        <div className="mb-3 space-y-1">
          {insights.map((text, idx) => (
            <p key={idx} className="text-xs text-gray-500">
              {text}
            </p>
          ))}
        </div>
      )}
      <div style={{ height: 280 }}>
        <AgCharts options={options} />
      </div>
    </div>
  );
}
