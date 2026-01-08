import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { getSkillMomentum } from "../../utils/api";
import { weekLabelFromYearWeek } from "../../utils/date";
import { useUser } from "../../context/UserContext";

const COLORS = {
  React: "#4f46e5",
  "Node.js": "#16a34a",
  SQL: "#dc2626",
  "API Design": "#ea580c",
  "System Design": "#0f766e",
  Communication: "#7c3aed",
  Debugging: "#0891b2",
};

export default function SkillMomentumChart() {
  const { user } = useUser();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    getSkillMomentum(user.id)
      .then(setRawData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const { chartData, skills, skillKeys, insights } = useMemo(() => {
    if (!rawData.length) {
      return { chartData: [], skills: [], skillKeys: {}, insights: [] };
    }

    const weeks = Array.from(new Set(rawData.map((r) => r.year_week))).sort(
      (a, b) => a - b
    );

    const skillWeekMap = {};
    const totals = {};

    rawData.forEach((r) => {
      skillWeekMap[r.skill_name] ??= {};
      skillWeekMap[r.skill_name][r.year_week] = r.signal_count;
      totals[r.skill_name] = (totals[r.skill_name] || 0) + r.signal_count;
    });

    const topSkills = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    const skillKeys = Object.fromEntries(
      topSkills.map((skill) => [skill, skill.replace(/[^a-zA-Z0-9]/g, "_")])
    );

    const rows = weeks.map((week, idx) => {
      const label = weekLabelFromYearWeek(week);
      const row = { week: label };
      const prevWeek = weeks[idx - 1];

      topSkills.forEach((skill) => {
        const current = skillWeekMap[skill]?.[week] || 0;
        const previous = prevWeek ? skillWeekMap[skill]?.[prevWeek] || 0 : 0;

        const key = skillKeys[skill];
        row[key] = current - previous;
      });

      return row;
    });

    const insights =
      weeks.length < 2 || !topSkills.length
        ? []
        : (() => {
            const lastWeek = weeks[weeks.length - 1];
            const prevWeek = weeks[weeks.length - 2];

            const deltas = topSkills.map((skill) => {
              const current = skillWeekMap[skill]?.[lastWeek] || 0;
              const previous = skillWeekMap[skill]?.[prevWeek] || 0;

              return {
                skill,
                delta: current - previous,
              };
            });

            const positive = deltas
              .filter((d) => d.delta > 0)
              .sort((a, b) => b.delta - a.delta);

            const negative = deltas
              .filter((d) => d.delta < 0)
              .sort((a, b) => a.delta - b.delta);

            const flat = deltas.every((d) => d.delta === 0);

            if (flat) {
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

  if (loading) {
    return (
      <p className="text-sm text-gray-500 text-center py-12">
        Loading skill momentum...
      </p>
    );
  }

  if (!chartData.length) {
    return (
      <p className="text-sm text-gray-500 text-center py-12">
        Activity will appear here as you continue working across projects,
        updates, and mentorship.
      </p>
    );
  }

  const options = {
    data: chartData,
    series: skills.map((skill) => ({
      type: "area",
      xKey: "week",
      yKey: skillKeys[skill],
      yName: skill,
      stacked: true,
      fill: COLORS[skill] || "#6b7280",
      fillOpacity: 0.55,
      stroke: COLORS[skill] || "#6b7280",
      strokeWidth: 1.5,
    })),
    axes: {
      x: {
        type: "category",
        position: "bottom",
        label: {
          fontSize: 12,
          wrapping: "on-space",
        },
      },
      y: {
        type: "number",
        position: "left",
        nice: true,
        label: { fontSize: 11 },
      },
    },
    padding: {
      top: 12,
      right: 48,
      bottom: 16,
      left: 18,
    },
    legend: {
      position: "bottom",
    },
    background: {
      fill: "transparent",
    },
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
