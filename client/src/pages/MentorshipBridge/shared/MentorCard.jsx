import React from "react";
import { Calendar, Clock, Users } from "lucide-react";

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition">
            {mentor.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{mentor.email}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
          MENTOR
        </span>
      </div>

      {/* Stats Section */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
        {tab === "available" ?
          <>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Next Available:</span>
              <span className="text-gray-600">
                {formatDate(mentor.nextAvailable?.date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-secondary">
                {mentor.availabilityCount}{" "}
                {mentor.availabilityCount === 1 ? "slot" : "slots"} available
              </span>
            </div>
          </>
        : <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 text-secondary" />
            <span className="font-medium">Projects:</span>
            <span className="text-gray-600">{mentor.projects || "N/A"}</span>
          </div>
        }
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile(mentor.id)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition"
        >
          View Profile
        </button>
        <button
          onClick={() => onRequestSession(mentor)}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary text-white hover:bg-secondary transition font-medium"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}
