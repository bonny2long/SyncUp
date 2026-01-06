import React, { useEffect, useState } from "react";
import {
  fetchSessions,
  updateSessionStatus,
  updateSessionDetails,
  rescheduleSession,
  deleteSession,
} from "../../utils/api";
import SessionCard from "./SessionCard";
import { useUser } from "../../context/UserContext";

const SESSION_FOCUS_FILTERS = [
  "all",
  "project_support",
  "technical_guidance",
  "career_guidance",
  "life_leadership",
  "alumni_advice",
];

export default function SessionList({ selectedMentorId, currentUser }) {
  const { user, loading: userLoading } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Primary and secondary filters
  const [focusFilter, setFocusFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadSessions() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessions(selectedMentorId);
      setSessions(data);
    } catch (err) {
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [selectedMentorId]);

  const handleUpdateStatus = async (id, status) => {
    const previous = sessions;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    try {
      await updateSessionStatus(id, { status });
    } catch (err) {
      setError("Failed to update status.");
      setSessions(previous);
    }
  };

  const handleUpdateDetails = async (id, updates) => {
    const previous = sessions;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    try {
      await updateSessionDetails(id, updates);
    } catch (err) {
      setError("Failed to save session changes.");
      setSessions(previous);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this session?");
    if (!confirm) return;

    const previous = sessions;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSession(id);
    } catch (err) {
      setError("Failed to delete session.");
      setSessions(previous);
    }
  };

  const handleReschedule = async (id, newDate) => {
    const previous = sessions;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, session_date: newDate, status: "rescheduled" } : s
      )
    );
    try {
      await rescheduleSession(id, newDate);
    } catch (err) {
      setError("Failed to reschedule.");
      setSessions(previous);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  // Apply filters
  const filteredSessions = sessions.filter((s) => {
    const focusMatch = focusFilter === "all" || s.session_focus === focusFilter;

    const statusMatch = statusFilter === "all" || s.status === statusFilter;

    return focusMatch && statusMatch;
  });

  const effectiveUser = currentUser || user;
  const effectiveUserLoading = userLoading;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary filters: Session focus */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {SESSION_FOCUS_FILTERS.map((focus) => (
          <button
            key={focus}
            onClick={() => setFocusFilter(focus)}
            className={`px-3 py-1 rounded-full text-xs transition ${
              focusFilter === focus
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {focus === "all"
              ? "All"
              : focus
                  .replace("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </button>
        ))}

        {/* Secondary filter: Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ml-auto border rounded px-2 py-1 text-xs text-gray-600"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      {filteredSessions.length === 0 ? (
        <p className="text-sm text-gray-500">
          {selectedMentorId
            ? "No sessions with this mentor yet."
            : "No mentorship sessions found."}
        </p>
      ) : (
        filteredSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onUpdateStatus={handleUpdateStatus}
            onUpdateDetails={handleUpdateDetails}
            onDelete={handleDelete}
            currentUser={effectiveUser}
            currentUserLoading={effectiveUserLoading}
            onReschedule={handleReschedule}
          />
        ))
      )}
    </div>
  );
}
