import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getSkillActivity } from "../../utils/api";
import { weekLabelFromYearWeek } from "../../utils/date";
import { useUser } from "../../context/UserContext";

const COLORS = {
  project: "#4f46e5",
  update: "#16a34a",
  mentorship: "#ea580c",
};

export default function SkillActivityChart() {
  const { user } = useUser();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    getSkillActivity(user.id)
      .then(setRawData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  /**
   * Transform rows into stacked-bar shape:
   * { week, project, update, mentorship }
   */
  const chartData = useMemo(() => {
    if (!rawData.length) return [];

    const byWeek = {};

    rawData.forEach(({ year_week, source_type, signal_count }) => {
      const label = weekLabelFromYearWeek(year_week);
      byWeek[year_week] ??= { week: label };
      byWeek[year_week][source_type] = signal_count;
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
    const label =
      source.charAt(0).toUpperCase() + source.slice(1);

    return `${label} contributed the most to activity this week.`;
  }, [chartData]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading activity...
      </p>
    );
  }

  if (!chartData.length) {
    return (
      <p className="text-sm text-gray-500">
        No activity yet. This updates automatically as you work.
      </p>
    );
  }

  return (
    <div className="w-full">
      {insight && (
        <p className="text-xs text-gray-500 mb-2">
          {insight}
        </p>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <XAxis dataKey="week" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="project"
            stackId="a"
            fill={COLORS.project}
          />
          <Bar
            dataKey="update"
            stackId="a"
            fill={COLORS.update}
          />
          <Bar
            dataKey="mentorship"
            stackId="a"
            fill={COLORS.mentorship}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
