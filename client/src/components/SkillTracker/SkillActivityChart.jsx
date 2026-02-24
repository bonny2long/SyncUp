import { useEffect, useMemo, useState, useCallback } from "react";
import { AgCharts } from "ag-charts-react";
import { getSkillActivity } from "../../utils/api";
import { weekLabelFromYearWeek } from "../../utils/date";
import { useUser } from "../../context/UserContext";
import SkeletonLoader from "../../components/shared/SkeletonLoader";
import { ChartError } from "../../components/shared/ErrorBoundary";
import { getErrorMessage } from "../../utils/errorHandler";
import { useChartTheme } from "./useChartTheme";

const COLORS = {
  project: "#4f46e5",
  update: "#16a34a",
  mentorship: "#ea580c",
};

export default function SkillActivityChart() {
  const { user } = useUser();
  const chartTheme = useChartTheme();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSkillActivity(user.id);
      setRawData(data);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Activity fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo(() => {
    if (!rawData.length) return [];

    const byWeek = {};

    rawData.forEach(({ year_week, source_type, signal_count }) => {
      const label = weekLabelFromYearWeek(year_week);

      byWeek[year_week] ??= {
        week: label,
        project: 0,
        update: 0,
        mentorship: 0,
      };

      byWeek[year_week][source_type] = Number(signal_count);
    });

    return Object.entries(byWeek)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, row]) => row);
  }, [rawData]);

  const insight = useMemo(() => {
    if (!chartData.length) return null;

    const last = chartData[chartData.length - 1];
    const dominant = Object.entries(last)
      .filter(([key]) => key !== "week")
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))[0];

    if (!dominant || (dominant[1] || 0) === 0) {
      return "No dominant activity source this week.";
    }

    const [source] = dominant;
    const label = source.charAt(0).toUpperCase() + source.slice(1);

    return `${label} contributed the most this week.`;
  }, [chartData]);

  if (loading) return <SkeletonLoader type="chart" height={200} />;
  if (error) return <ChartError onRetry={loadData} error={error} />;
  if (!chartData.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-secondary">No activity yet.</p>
      </div>
    );
  }

  const options = {
    data: chartData,
    series: [
      {
        type: "bar",
        xKey: "week",
        yKey: "project",
        yName: "Project",
        stacked: true,
        fill: COLORS.project,
      },
      {
        type: "bar",
        xKey: "week",
        yKey: "update",
        yName: "Update",
        stacked: true,
        fill: COLORS.update,
      },
      {
        type: "bar",
        xKey: "week",
        yKey: "mentorship",
        yName: "Mentorship",
        stacked: true,
        fill: COLORS.mentorship,
      },
    ],
    axes: {
      x: {
        type: "category",
        position: "bottom",
        label: { fontSize: 11, wrapping: "on-space", color: chartTheme.axisLabelColor },
      },
      y: {
        type: "number",
        position: "left",
        nice: true,
        label: { fontSize: 11, color: chartTheme.axisLabelColor },
      },
    },
    padding: { top: 6, right: 12, bottom: 8, left: 12 },
    legend: {
      position: "bottom",
      item: { label: { color: chartTheme.legendLabelColor } },
    },
    background: { fill: "transparent" },
  };

  return (
    <div className="w-full">
      {insight && <p className="text-xs text-text-secondary mb-2">{insight}</p>}
      <div style={{ height: 200 }}>
        <AgCharts options={options} />
      </div>
    </div>
  );
}
