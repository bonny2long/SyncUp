import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

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

  /**
   * Backend rows:
   * { skill_name, year_week, signal_count }
   */
  const { chartData, skills, insights } = useMemo(() => {
    if (!rawData.length) {
      return { chartData: [], skills: [], insights: [] };
    }

    const weeks = Array.from(
      new Set(rawData.map((r) => r.year_week))
    ).sort((a, b) => a - b);

    const skillWeekMap = {};
    const totals = {};

    rawData.forEach((r) => {
      skillWeekMap[r.skill_name] ??= {};
      skillWeekMap[r.skill_name][r.year_week] = r.signal_count;
      totals[r.skill_name] =
        (totals[r.skill_name] || 0) + r.signal_count;
    });

    const topSkills = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    const rows = weeks.map((week, idx) => {
      const label = weekLabelFromYearWeek(week);
      const row = { week: label };
      const prevWeek = weeks[idx - 1];

      topSkills.forEach((skill) => {
        const current = skillWeekMap[skill]?.[week] || 0;
        const previous = prevWeek
          ? skillWeekMap[skill]?.[prevWeek] || 0
          : 0;

        row[skill] = current - previous;
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
              const current =
                skillWeekMap[skill]?.[lastWeek] || 0;
              const previous =
                skillWeekMap[skill]?.[prevWeek] || 0;

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
              return [
                "Your activity remained steady across skills this week.",
              ];
            }

            if (positive[0] && negative[0]) {
              return [
                `${positive[0].skill} saw the biggest increase, while ${negative[0].skill} slowed slightly.`,
              ];
            }

            if (positive[0]) {
              return [
                `${positive[0].skill} increased compared to last week.`,
              ];
            }

            return [];
          })();

    return {
      chartData: rows,
      skills: topSkills,
      insights,
    };
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
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            label={{
              value: "Week-over-week change",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value) => [
              `${value > 0 ? "+" : ""}${value} vs last week`,
              "Delta",
            ]}
          />
          <Legend />
          {skills.map((skill) => {
            const isFlatSkill = chartData.every(
              (row) => Math.abs(row[skill] || 0) <= 1
            );

            return (
              <Line
                key={skill}
                type="monotone"
                dataKey={skill}
                stroke={COLORS[skill] || "#6b7280"}
                strokeWidth={isFlatSkill ? 1.5 : 3}
                strokeOpacity={isFlatSkill ? 0.4 : 1}
                dot={!isFlatSkill}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
