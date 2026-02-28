import React, { useEffect, useState } from "react";
import { MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function TeamActivityFeed({ projectId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function fetchTeamUpdates() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/progress_updates/project/${projectId}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUpdates(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch team updates:", err);
        setError("Failed to load team updates");
      } finally {
        setLoading(false);
      }
    }

    fetchTeamUpdates();
  }, [projectId]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-neutral-dark">Team Activity</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-surface-highlight rounded transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-neutral-dark">Team Activity</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-surface-highlight rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <p className="text-sm text-text-secondary text-center py-4">
          Select a project to view team activity
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-neutral-dark">Team Activity</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-surface-highlight rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-neutral-dark">Team Activity</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-surface-highlight rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <p className="text-sm text-text-secondary text-center py-4">
          No team updates yet. Be the first to post!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-secondary" />
          <h3 className="font-semibold text-neutral-dark">Team Activity</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-surface-highlight rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="flex gap-3 p-2 rounded-lg hover:bg-surface-highlight transition"
            >
              <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full text-primary font-semibold text-xs flex-shrink-0">
                {getInitials(update.user_name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-neutral-dark">
                    {update.user_name || "Unknown"}
                  </span>
                  {update.user_role && (
                    <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {update.user_role}
                    </span>
                  )}
                </div>

                <p className="text-sm text-text-secondary line-clamp-2">
                  {update.content}
                </p>

                <div className="flex items-center gap-1 mt-1.5 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(update.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
