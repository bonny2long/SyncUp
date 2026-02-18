import { useEffect, useState, useMemo } from "react";
import { getSkillSummary } from "../../utils/api";
import { useUser } from "../../context/UserContext";

const MAX_MOMENTUM_ITEMS = 10;

/**
 * SkillSignalsPanel - Read-only verification surface
 *
 * Shows:
 * - Skill name
 * - Direction arrow (↑ ↓ →)
 * - Velocity (per day)
 *
 * Scales by showing top N skills sorted by velocity,
 * with an expand/collapse toggle for the full list.
 */
export default function SkillSignalsPanel() {
  const { user } = useUser();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

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

  // Sort by absolute velocity descending so most active skills are first
  const {
    visibleSkills,
    hiddenCount,
    inactiveCount,
    totalCount,
    needsTruncation,
  } = useMemo(() => {
    if (!skills.length) {
      return {
        visibleSkills: [],
        hiddenCount: 0,
        inactiveCount: 0,
        totalCount: 0,
        needsTruncation: false,
      };
    }

    // Sort by absolute velocity (highest first), then by total_weight as tiebreaker
    const sorted = [...skills].sort((a, b) => {
      const aVel = Math.abs(a.velocity?.per_day || 0);
      const bVel = Math.abs(b.velocity?.per_day || 0);
      if (bVel !== aVel) return bVel - aVel;
      return (b.total_weight || 0) - (a.total_weight || 0);
    });

    const needsTruncation = sorted.length > MAX_MOMENTUM_ITEMS;
    const inactiveCount = sorted.filter(
      (s) => (s.velocity?.per_day || 0) === 0,
    ).length;

    if (!expanded && needsTruncation) {
      return {
        visibleSkills: sorted.slice(0, MAX_MOMENTUM_ITEMS),
        hiddenCount: sorted.length - MAX_MOMENTUM_ITEMS,
        inactiveCount,
        totalCount: sorted.length,
        needsTruncation: true,
      };
    }

    return {
      visibleSkills: sorted,
      hiddenCount: 0,
      inactiveCount,
      totalCount: sorted.length,
      needsTruncation,
    };
  }, [skills, expanded]);

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
      <div
        style={{
          maxHeight: expanded ? "none" : `${MAX_MOMENTUM_ITEMS * 36 + 8}px`,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        {visibleSkills.map((skill) => (
          <SkillRow key={skill.skill_id} skill={skill} />
        ))}
      </div>

      {/* Hidden / inactive count */}
      {!expanded && hiddenCount > 0 && (
        <p className="text-xs text-text-secondary mt-1">
          + {hiddenCount} more skill{hiddenCount !== 1 ? "s" : ""} not shown
          {inactiveCount > 0 && (
            <span> · {inactiveCount} with no recent activity</span>
          )}
        </p>
      )}

      {/* Expand/collapse toggle */}
      {(needsTruncation || expanded) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer self-start"
        >
          {expanded ? "Show Less ↑" : `View All ${totalCount} Skills →`}
        </button>
      )}
    </div>
  );
}

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
