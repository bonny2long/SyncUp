import React from "react";
import { X, Mail, Briefcase, CalendarClock } from "lucide-react";

export default function MentorProfileModal({ mentor, onClose }) {
  if (!mentor) return null;

  const availability = Array.isArray(mentor.availability)
    ? mentor.availability.slice(0, 5)
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
              {mentor.name?.charAt(0) || "M"}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary leading-tight">
                {mentor.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600 items-center">
                {mentor.role && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
                    <Briefcase size={14} /> {mentor.role}
                  </span>
                )}
                {mentor.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-light text-neutral-dark text-xs">
                    <Mail size={14} /> {mentor.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
            <div className="p-3 rounded-xl bg-neutral-light border border-gray-100">
              <p className="text-[11px] uppercase text-gray-500 mb-1">Sessions</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                <span className="font-semibold text-secondary">
                  Total: {mentor.stats?.total_sessions || 0}
                </span>
                <span>Completed: {mentor.stats?.completed_sessions || 0}</span>
                <span>Accepted: {mentor.stats?.accepted_sessions || 0}</span>
                <span>Pending: {mentor.stats?.pending_sessions || 0}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-light border border-gray-100">
              <p className="text-[11px] uppercase text-gray-500 mb-1">Availability</p>
              {availability.length ? (
                <div className="flex flex-col gap-1 text-[12px] text-gray-700">
                  {availability.map((slot, idx) => (
                    <div
                      key={`${slot.available_date || idx}-${slot.available_time || idx}`}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-gray-100"
                    >
                      <CalendarClock size={14} className="text-primary" />
                      <span>{slot.available_date || "Date TBA"}</span>
                      <span className="text-gray-500">•</span>
                      <span>{slot.available_time || "Time TBA"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No availability listed.</p>
              )}
            </div>
          </div>

          {mentor.bio && (
            <div className="p-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-700">
              <p className="text-[11px] uppercase text-gray-500 mb-1">About</p>
              <p>{mentor.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
