import React from "react";
import { Calendar, Clock, Users } from "lucide-react";

export default function MentorCard({
  mentor,
  tab,
  onViewProfile,
  onRequestSession,
}) {
  const formatAvailability = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return "N/A";

    let readableDate = "";
    if (dateStr) {
      const dateObj =
        dateStr.includes("T") ?
          new Date(dateStr)
        : new Date(`${dateStr}T00:00:00`);
      readableDate =
        Number.isNaN(dateObj.getTime()) ? dateStr : (
          dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
    }

    let readableTime = "";
    if (timeStr) {
      const [h = "00", m = "00"] = timeStr.split(":");
      const dateForTime = new Date();
      dateForTime.setHours(Number(h), Number(m), 0, 0);
      readableTime = dateForTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return `${readableDate} ${readableTime}`.trim();
  };

  const contextLabel =
    tab === "available" ?
      formatAvailability(mentor.available_date, mentor.available_time)
    : mentor.projects || "Project mentor";

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

      {/* Availability/Projects Info */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {tab === "available" ?
            <>
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Next Available:</span>
            </>
          : <>
              <Users className="w-4 h-4 text-secondary" />
              <span className="font-medium">Projects:</span>
            </>
          }
          <span className="text-gray-600">{contextLabel || "N/A"}</span>
        </div>
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
          Request Session
        </button>
      </div>
    </div>
  );
}
