import { useEffect, useState } from "react";
import { getSkillSummary } from "../../utils/api";
import { useUser } from "../../context/UserContext";

/**
 * SkillSignalsPanel - Read-only verification surface
 *
 * Purpose: Display transition + velocity data to verify
 * backend math is correct before wiring into charts.
 *
 * Shows:
 * - Skill name
 * - Direction arrow (↑ ↓ →)
 * - Velocity (per day)
 */
export default function SkillSignalsPanel() {
  const { user } = useUser();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getSkillSummary(user.id);
        setSkills(data.skills || []);
      } catch (err) {
        console.error("SkillSignalsPanel:", err);
        setError("Failed to load skill summary");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-text-secondary">Loading skill signals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-text-secondary">
          No skill data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <SkillRow key={skill.skill_id} skill={skill} />
      ))}
    </div>
  );
}

/**
 * SkillRow - Visual display for a single skill's transition + velocity
 */

/**
 * SkillRow - Visual display for a single skill's transition + velocity
 */
function SkillRow({ skill }) {
  const { skill_name, transition, velocity } = skill;

  // Direction icon based on transition
  const directionIcon =
    transition?.direction === "up" ? "↑"
    : transition?.direction === "down" ? "↓"
    : "→";

  // Color based on direction
  const directionColor =
    transition?.direction === "up" ? "text-green-600"
    : transition?.direction === "down" ? "text-red-600"
    : "text-text-secondary";

  // Format velocity (handle undefined/null)
  const velocityDisplay =
    velocity?.per_day != null ? `${velocity.per_day.toFixed(2)} / day` : "—";

  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-border last:border-b-0">
      <span className="font-medium text-neutral-dark">
        {skill_name || "Unknown Skill"}
      </span>

      <div className="flex items-center gap-3">
        {/* Direction arrow */}
        <span className={`font-bold text-lg ${directionColor}`}>
          {directionIcon}
        </span>

        {/* Velocity */}
        <span className="text-xs text-text-secondary min-w-[70px] text-right">
          {velocityDisplay}
        </span>
      </div>
    </div>
  );
}
