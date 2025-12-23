import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSkillDistribution } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import SkillTrackerSection from "./SkillTrackerSection";

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

  if (loading) {
    return (
      <SkillTrackerSection title="Skill Distribution">
        <p className="text-sm text-gray-500">Loading skill data…</p>
      </SkillTrackerSection>
    );
  }

  if (!data.length) {
    return (
      <SkillTrackerSection
        title="Skill Distribution"
        subtitle="Derived from your real activity"
      >
        <p className="text-sm text-gray-500">
          No skill activity yet. This will update automatically as you work on
          projects, post updates, and complete mentorship sessions.
        </p>
      </SkillTrackerSection>
    );
  }

  return (
    <SkillTrackerSection
      title="Skill Distribution"
      subtitle="Where your effort has gone so far"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="skill"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SkillTrackerSection>
  );
}
