import React from "react";
import { Award, Calendar, Clock, Users } from "lucide-react";
import RoleBadge from "../../../components/shared/RoleBadge";

export default function MentorCard({
  mentor,
  tab,
  onViewProfile,
  onRequestSession,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const completedSessions = Number(mentor.completed_sessions) || 0;
  const lastSessionLabel = formatMonthYear(mentor.last_session_at);

  return (
    <div className="brand-card brand-card-hover group relative overflow-hidden p-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      {/* Header */}
      <div className="mb-3 flex items-start justify-between pt-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-neutral-dark transition group-hover:text-primary">
              {mentor.name}
            </h3>
            <RoleBadge role={mentor.role} size="xs" />
          </div>
          {mentor.cycle && (
            <p className="text-xs text-text-secondary mt-0.5">
              Commenced {mentor.cycle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            {completedSessions > 0 ?
              <span className="inline-flex items-center gap-1">
                <Award className="w-3 h-3 text-primary" />
                {completedSessions} session
                {completedSessions === 1 ? "" : "s"} completed
              </span>
            : <span className="text-text-secondary/70">New mentor</span>}
            {lastSessionLabel && <span>Active {lastSessionLabel}</span>}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{mentor.email}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-4 space-y-2 rounded-lg border border-border bg-surface-highlight/70 p-3">
        {tab === "available" ?
          <>
            <div className="flex items-center gap-2 text-sm text-neutral-dark">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Next Available:</span>
              <span className="text-text-secondary">
                {formatDate(mentor.nextAvailable?.date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">
                {mentor.availabilityCount}{" "}
                {mentor.availabilityCount === 1 ? "slot" : "slots"} available
              </span>
            </div>
          </>
        : <div className="flex items-center gap-2 text-sm text-neutral-dark">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">Projects:</span>
            <span className="text-text-secondary">
              {mentor.projects || "N/A"}
            </span>
          </div>
        }
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile(mentor.id)}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-neutral-dark transition hover:border-primary hover:text-primary"
        >
          View Profile
        </button>
        <button
          onClick={() => onRequestSession(mentor)}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}
