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

export default function SessionList({ selectedMentorId, currentUser }) {
  const { user, loading: userLoading } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [selectedMentorId]); // reload when filter changes

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

  const filteredSessions =
    statusFilter === "all"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  const effectiveUser = currentUser || user;
  const effectiveUserLoading = userLoading;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs">
        {["all", "pending", "accepted", "completed", "declined", "rescheduled"].map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full border text-[11px] transition ${
                statusFilter === status
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
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
