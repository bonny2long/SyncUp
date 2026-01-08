import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
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

    const sorted = [...data].sort((a, b) => a.skill.localeCompare(b.skill));

    const totalSignals = sorted.reduce((sum, s) => sum + s.total, 0);

    const topEntry = sorted.reduce(
      (best, s) => (!best || s.total > best.total ? s : best),
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
      <p className="text-sm text-gray-500">Loading skill distribution...</p>
    );
  }

  if (!sortedData.length) {
    return (
      <p className="text-sm text-gray-500">
        No activity yet. This updates automatically as you work.
      </p>
    );
  }

  const chartOptions = {
    data: sortedData,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "skill",
        yKey: "total",
        cornerRadius: 4,
        itemStyler: ({ datum }) => ({
          fill: SKILL_COLORS[datum.skill] || "#64748b",
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
      },
      category: {
        position: "left",
        label: {
          fontSize: 12,
        },
      },
    },
    padding: {
      left: 20,
      right: 20,
      top: 10,
      bottom: 10,
    },
    background: {
      fill: "transparent",
    },
  };

  return (
    <div className="w-full">
      {insight && <p className="text-xs text-gray-500 mb-2">{insight}</p>}
      <div style={{ height: 260 }}>
        <AgCharts options={chartOptions} />
      </div>
    </div>
  );
}
