import { useEffect, useState } from "react";
import { AgCharts } from "ag-charts-react";
import { useUser } from "../../context/UserContext";
import { getSkillSummary } from "../../utils/api";
import { useChartTheme } from "./useChartTheme";

const TREND_LABELS = {
  emerging: "Emerging strength",
  growing: "Actively growing",
  stable: "Holding steady",
};

const TREND_COLORS = {
  emerging: "#2563eb",
  growing: "#16a34a",
  stable: "#6b7280",
};

export default function SkillSummaryCard() {
  const { user } = useUser();
  const chartTheme = useChartTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user?.id) return;

    getSkillSummary(user.id)
      .then((res) => setSkills(res.skills || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm text-text-secondary">Loading skill snapshot...</p>
      </div>
    );
  }

  if (!skills.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm text-text-secondary">
          Skill insights will appear as signals accumulate.
        </p>
      </div>
    );
  }

  const chartData = skills.map((s, i) => {
    const trendKey =
      s.trend || s.trend_label || s.trend_readiness_label || s.trend_readiness;
    const trendLabel =
      TREND_LABELS[trendKey] ||
      s.trend_label ||
      s.trend_readiness_label ||
      (trendKey ? String(trendKey) : "Unknown");

    const SIZE_BY_TREND = {
      growing: 55,
      emerging: 40,
      stable: 25,
    };

    return {
      skill: s.skill_name,
      weight: s.total_weight + i * 0.15, // visual offset only
      signals: s.signal_count,
      trend: trendKey,
      trendLabel,
      size: SIZE_BY_TREND[trendKey] || 32,
    };
  });

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h3 className="font-medium text-neutral-dark">Top Skills Snapshot</h3>
      <p className="text-xs text-text-secondary mt-1">
        A high-level view of your current skill momentum
      </p>

      <div className="mt-4" style={{ height: 260 }}>
        <AgCharts
          options={{
            data: chartData,
            series: [
              {
                type: "bubble",
                xKey: "weight",
                yKey: "skill",
                sizeKey: "size",
                sizeName: "Momentum",
                labelKey: "trendLabel",
                itemStyler: ({ datum }) => ({
                  fill: TREND_COLORS[datum.trend] || "#64748b",
                  fillOpacity:
                    datum.trend === "growing" ? 1
                    : datum.trend === "emerging" ? 0.75
                    : 0.5,
                  stroke: TREND_COLORS[datum.trend] || "#64748b",
                  strokeWidth: datum.trend === "growing" ? 2 : 1,
                }),
                tooltip: {
                  renderer: ({ datum }) => ({
                    title: datum.skill,
                    data: [
                      { label: "Momentum", value: datum.trendLabel },
                      { label: "Signals", value: datum.signals },
                      { label: "Strength", value: datum.weight.toFixed(2) },
                    ],
                  }),
                },
              },
            ],
            axes: {
              x: {
                type: "number",
                position: "bottom",
                nice: true,
                label: {
                  fontSize: 11,
                  color: chartTheme.axisLabelColor,
                },
                title: {
                  text: "Skill Strength",
                  color: chartTheme.axisTitleColor,
                },
              },
              y: {
                type: "category",
                position: "left",
                label: {
                  fontSize: 12,
                  wrapping: "on-space",
                  color: chartTheme.axisLabelColor,
                },
              },
            },
            legend: {
              enabled: false,
            },
            background: {
              fill: "transparent",
            },
            padding: {
              top: 12,
              right: 24,
              bottom: 24,
              left: 48,
            },
          }}
        />
      </div>
    </div>
  );
}
