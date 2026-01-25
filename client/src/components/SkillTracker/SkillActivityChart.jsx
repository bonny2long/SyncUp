import { useEffect, useMemo, useState, useCallback } from "react";
import { AgCharts } from "ag-charts-react";
import { getSkillActivity } from "../../utils/api";
import { weekLabelFromYearWeek } from "../../utils/date";
import { useUser } from "../../context/UserContext";
import SkeletonLoader from "../../components/shared/SkeletonLoader";
import { ChartError } from "../../components/shared/ErrorBoundary";
import { getErrorMessage } from "../../utils/errorHandler";

const COLORS = {
  project: "#4f46e5",
  update: "#16a34a",
  mentorship: "#ea580c",
};

export default function SkillActivityChart() {
  const { user } = useUser();
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

    return `${label} contributed the most to activity this week.`;
  }, [chartData]);

  if (loading) {
    return <SkeletonLoader type="chart" height={260} />;
  }

  if (error) {
    return <ChartError onRetry={loadData} error={error} />;
  }

  if (!chartData.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No activity yet.</p>
        <p className="text-xs text-gray-400 mt-2">
          This updates automatically as you work.
        </p>
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
        label: { fontSize: 12, wrapping: "on-space" },
      },
      y: {
        type: "number",
        position: "left",
        nice: true,
        label: { fontSize: 11 },
      },
    },
    padding: { top: 12, right: 24, bottom: 16, left: 18 },
    legend: { position: "bottom" },
    background: { fill: "transparent" },
  };

  return (
    <div className="w-full">
      {insight && <p className="text-xs text-gray-500 mb-2">{insight}</p>}
      <div style={{ height: 260 }}>
        <AgCharts options={options} />
      </div>
    </div>
  );
}
