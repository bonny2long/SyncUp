import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getSkillDistribution } from "../../utils/api";
import { useUser } from "../../context/UserContext";

const SKILL_COLORS = {
  React: "#4f46e5",
  "Node.js": "#16a34a",
  SQL: "#dc2626",
  "API Design": "#ea580c",
  "System Design": "#0f766e",
  Communication: "#7c3aed",
  Debugging: "#0891b2",
};

export default function SkillDistributionChart() {
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    getSkillDistribution(user.id)
      .then(setData)
      .catch((err) => {
        console.error("Skill fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const { sortedData, insight } = useMemo(() => {
    if (!data.length) {
      return { sortedData: [], insight: null };
    }

    const sorted = [...data].sort((a, b) =>
      a.skill.localeCompare(b.skill)
    );

    const totalSignals = sorted.reduce(
      (sum, s) => sum + s.total,
      0
    );

    const topEntry = sorted.reduce(
      (best, s) =>
        !best || s.total > best.total ? s : best,
      null
    );

    const insight =
      topEntry && totalSignals > 0
        ? topEntry.total / totalSignals > 0.25
          ? `${topEntry.skill} represents ${Math.round(
              (topEntry.total / totalSignals) * 100
            )}% of recent activity.`
          : "Your activity is evenly distributed across skills."
        : null;

    return { sortedData: sorted, insight };
  }, [data]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading skill distribution...
      </p>
    );
  }

  if (!sortedData.length) {
    return (
      <p className="text-sm text-gray-500">
        No activity yet. This updates automatically as you work.
      </p>
    );
  }

  return (
    <div className="w-full">
      {insight && (
        <p className="text-xs text-gray-500 mb-2">{insight}</p>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sortedData} layout="vertical">
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="skill"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value} signals`, "Total"]}
            labelFormatter={(label) => `Skill: ${label}`}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry) => (
              <Cell
                key={entry.skill}
                fill={
                  SKILL_COLORS[entry.skill] || "#64748b"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
