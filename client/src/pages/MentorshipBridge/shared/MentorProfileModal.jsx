import React from "react";
import { Award, CalendarClock, Mail, X } from "lucide-react";
import { formatDateTimeCompact } from "../../../utils/date";
import RoleBadge from "../../../components/shared/RoleBadge";

export default function MentorProfileModal({ mentor, onClose }) {
  if (!mentor) return null;

  const availability =
    Array.isArray(mentor.availability) ? mentor.availability.slice(0, 5) : [];
  const lastActive =
    mentor.stats?.last_session_at ?
      new Date(mentor.stats.last_session_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-accent/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-text-secondary transition hover:bg-surface-highlight hover:text-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-8">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
              {mentor.name?.charAt(0) || "M"}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase text-primary">
                Mentor Profile
              </p>
              <h3 className="text-2xl font-black leading-tight text-neutral-dark">
                {mentor.name}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                {mentor.role && <RoleBadge role={mentor.role} size="xs" />}
                {mentor.email && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-highlight px-2 py-1 text-xs text-neutral-dark">
                    <Mail size={14} /> {mentor.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 text-sm text-text-secondary sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-highlight p-3">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase text-text-secondary">
                <Award className="h-3.5 w-3.5 text-primary" />
                Sessions
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-neutral-dark">
                <span className="font-semibold text-primary">
                  Total: {mentor.stats?.total_sessions || 0}
                </span>
                <span>Completed: {mentor.stats?.completed_sessions || 0}</span>
                <span>Accepted: {mentor.stats?.accepted_sessions || 0}</span>
                <span>Pending: {mentor.stats?.pending_sessions || 0}</span>
                {lastActive && <span>Active: {lastActive}</span>}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-highlight p-3">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase text-text-secondary">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                Availability
              </p>
              {availability.length ?
                <div className="flex flex-col gap-1 text-[12px] text-neutral-dark">
                  {availability.map((slot, idx) => (
                    <div
                      key={`${slot.available_date || idx}-${slot.available_time || idx}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1"
                    >
                      <CalendarClock size={14} className="text-primary" />
                      <span className="font-medium">
                        {formatDateTimeCompact(
                          slot.available_date,
                          slot.available_time,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              : <p className="text-xs text-text-secondary">No availability listed.</p>
              }
            </div>
          </div>

          {mentor.bio && (
            <div className="rounded-xl border border-border bg-surface p-3 text-sm text-text-secondary">
              <p className="mb-1 text-[11px] font-bold uppercase text-text-secondary">
                About
              </p>
              <p>{mentor.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
