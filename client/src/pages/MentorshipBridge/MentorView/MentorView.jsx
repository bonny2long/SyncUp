import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import { fetchMentorSessions } from "../../../utils/api";
import IncomingRequests from "./IncomingRequests";
import MySessions from "./MySessions";
import MentorshipHistory from "./MentorshipHistory";
import MentorLeaderboard from "./MentorLeaderboard";
import AvailabilityManager from "./AvailabilityManager";
import EncouragementBoard from "../../../components/community/EncouragementBoard";

export default function MentorView() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("mentorshipMentorTab") || "requests";
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem("mentorshipMentorTab", activeTab);
  }, [activeTab]);

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMentorSessions(user.id);
      setSessions(data);
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
  const completedSessions = sessions.filter((s) => s.status === "completed");

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
            <h1 className="page-title mt-1">Mentorship</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Review session requests, guide current interns, and keep the
              mentorship pipeline moving.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border bg-surface-highlight px-3 py-2">
              <p className="text-lg font-black text-primary">
                {pendingSessions.length}
              </p>
              <p className="text-[10px] font-semibold uppercase text-text-secondary">
                Pending
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-highlight px-3 py-2">
              <p className="text-lg font-black text-primary">
                {acceptedSessions.length}
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
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="brand-card flex flex-wrap gap-1 p-1">
        <button
          onClick={() => setActiveTab("requests")}
          className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "requests" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          Incoming Requests
          {pendingSessions.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
              {pendingSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "sessions" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          My Sessions ({acceptedSessions.length})
        </button>

        <button
          onClick={() => setActiveTab("availability")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "availability" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          Availability
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

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "leaderboard" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          Leaderboard
        </button>

        <button
          onClick={() => setActiveTab("encouragement")}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "encouragement" ?
              "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-surface-highlight hover:text-neutral-dark"
          }`}
        >
          Encouragement
        </button>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-fade-in">
        {activeTab === "requests" && (
          <IncomingRequests
            sessions={pendingSessions}
            loading={loading}
            error={error}
            onRefresh={loadSessions}
          />
        )}

        {activeTab === "sessions" && (
          <MySessions
            sessions={acceptedSessions}
            loading={loading}
            error={error}
            onRefresh={loadSessions}
          />
        )}

        {activeTab === "availability" && <AvailabilityManager />}

        {activeTab === "history" && (
          <MentorshipHistory
            sessions={completedSessions}
            allSessions={sessions}
            loading={loading}
            error={error}
          />
        )}

        {activeTab === "leaderboard" && <MentorLeaderboard />}

        {activeTab === "encouragement" && (
          <EncouragementBoard mode="post" />
        )}
      </div>
    </div>
  );
}
