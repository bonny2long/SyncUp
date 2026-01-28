import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import { fetchMentorSessions } from "../../../utils/api";
import IncomingRequests from "./IncomingRequests";
import MySessions from "./MySessions";
import MentorshipHistory from "./MentorshipHistory";

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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">Mentorship</h1>
        <p className="text-sm text-gray-600">
          Review session requests and guide the next generation of developers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-3 font-medium transition-all relative ${
            activeTab === "requests" ?
              "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Incoming Requests
          {pendingSessions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-3 font-medium transition-all ${
            activeTab === "sessions" ?
              "text-secondary border-b-2 border-secondary"
            : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Sessions ({acceptedSessions.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 font-medium transition-all ${
            activeTab === "history" ?
              "text-accent border-b-2 border-accent"
            : "text-gray-600 hover:text-gray-900"
          }`}
        >
          History ({completedSessions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
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

        {activeTab === "history" && (
          <MentorshipHistory
            sessions={completedSessions}
            allSessions={sessions}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
