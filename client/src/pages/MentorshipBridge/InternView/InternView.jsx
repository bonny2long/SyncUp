import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import { fetchInternSessions } from "../../../utils/api";
import FindMentors from "./FindMentors";
import MyRequests from "./MyRequests";
import SessionHistory from "./SessionHistory";

export default function InternView() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("mentorshipInternTab") || "find";
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem("mentorshipInternTab", activeTab);
  }, [activeTab]);

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchInternSessions(user.id);

      // Additional security: Filter to ensure only this intern's sessions
      const filteredSessions = data.filter(
        (session) => session.intern_id === user.id,
      );

      setSessions(filteredSessions);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load your sessions");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Group sessions by status
  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const acceptedSessions = sessions.filter((s) => s.status === "accepted");
  const declinedSessions = sessions.filter((s) => s.status === "declined");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const activeRequestCount = pendingSessions.length + acceptedSessions.length;

  return (
    <div className="page-shell flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
        <div className="flex flex-col gap-4 pl-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker font-semibold uppercase">
              Mentorship Bridge
            </p>
            <h1 className="page-title mt-1">Find a Mentor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Connect with experienced iCAA residents and alumni to accelerate
              your learning.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border bg-surface-highlight px-3 py-2">
              <p className="text-lg font-black text-primary">
                {activeRequestCount}
              </p>
              <p className="text-[10px] font-semibold uppercase text-text-secondary">
                Active
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-highlight px-3 py-2">
              <p className="text-lg font-black text-primary">
                {completedSessions.length}
              </p>
              <p className="text-[10px] font-semibold uppercase text-text-secondary">
                Done
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-highlight px-3 py-2">
              <p className="text-lg font-black text-primary">
                {declinedSessions.length}
              </p>
              <p className="text-[10px] font-semibold uppercase text-text-secondary">
                Closed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="brand-card flex flex-wrap gap-1 p-1">
        <button
          onClick={() => setActiveTab("find")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "find" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          Find Mentors
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "requests" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          My Requests
          {activeRequestCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
              {activeRequestCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "history" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          History ({completedSessions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-fade-in">
        {activeTab === "find" && (
          <FindMentors onSessionRequested={loadSessions} />
        )}

        {activeTab === "requests" && (
          <MyRequests
            pending={pendingSessions}
            accepted={acceptedSessions}
            declined={declinedSessions}
            loading={loading}
            error={error}
            onRefresh={loadSessions}
            onFindMentors={() => setActiveTab("find")}
          />
        )}

        {activeTab === "history" && (
          <SessionHistory
            sessions={completedSessions}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
