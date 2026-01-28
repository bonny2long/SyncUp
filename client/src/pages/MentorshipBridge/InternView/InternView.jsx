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
  const declinedSessions = sessions.filter((s) => s.status === "declined");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">Find a Mentor</h1>
        <p className="text-sm text-gray-600">
          Connect with experienced mentors to accelerate your learning
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("find")}
          className={`px-4 py-3 font-medium transition-all ${
            activeTab === "find" ?
              "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Find Mentors
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-3 font-medium transition-all relative ${
            activeTab === "requests" ?
              "text-secondary border-b-2 border-secondary"
            : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Requests
          {pendingSessions.length + acceptedSessions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">
              {pendingSessions.length + acceptedSessions.length}
            </span>
          )}
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
