import React, { useState, useMemo } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import EmptyState from "../../../components/brand/EmptyState";

export default function MentorshipHistory({
  sessions,
  allSessions,
  loading,
  error,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    intern: "",
    topic: "",
    dateRange: "all",
  });
  const [expandedId, setExpandedId] = useState(null);

  const clearFilters = () => {
    setFilters({ intern: "", topic: "", dateRange: "all" });
  };

  const hasActiveFilters =
    filters.intern || filters.topic || filters.dateRange !== "all";

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filters.intern && session.intern_name !== filters.intern) return false;
      if (
        filters.topic &&
        !session.topic.toLowerCase().includes(filters.topic.toLowerCase())
      ) {
        return false;
      }
      if (filters.dateRange !== "all") {
        const sessionDate = new Date(session.session_date);
        const now = new Date();
        const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case "30days":
            if (daysDiff > 30) return false;
            break;
          case "90days":
            if (daysDiff > 90) return false;
            break;
          case "year":
            if (daysDiff > 365) return false;
            break;
        }
      }
      return true;
    });
  }, [sessions, filters]);

  // Get unique interns for filter dropdown
  const uniqueInterns = useMemo(() => {
    return [...new Set(sessions.map((s) => s.intern_name))];
  }, [sessions]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="brand-card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-card border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
        <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No completed sessions yet"
        description="Your mentorship impact will be tracked here once you complete sessions."
      />
    );
  }

  // Calculate stats
  const totalSessions = sessions.length;
  const uniqueInternsCount = new Set(sessions.map((s) => s.intern_id)).size;
  const technicalSessions = sessions.filter((s) =>
    ["project_support", "technical_guidance"].includes(s.session_focus),
  ).length;
  const totalRequests = allSessions.length;

  return (
    <div className="space-y-5">
      <div className="brand-card flex items-center gap-3 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Mentorship History
          </p>
          <h2 className="text-xl font-bold text-neutral-dark">
            Completed support and impact
          </h2>
          <p className="text-sm text-text-secondary">
            Review finished sessions, filter by intern, and track technical
            guidance work.
          </p>
        </div>
      </div>

      {/* Impact Stats - Compact */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ImpactCard
          icon={<Award className="h-4 w-4" />}
          label="Total"
          value={totalSessions}
        />
        <ImpactCard
          icon={<Users className="h-4 w-4" />}
          label="Interns"
          value={uniqueInternsCount}
        />
        <ImpactCard
          icon={<Zap className="h-4 w-4" />}
          label="Technical"
          value={technicalSessions}
        />
        <ImpactCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Requests"
          value={totalRequests}
        />
      </div>

      {/* Filter Toggle */}
      <div className="brand-card flex items-center justify-between p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            showFilters || hasActiveFilters
              ? "bg-primary text-white"
              : "border border-border bg-surface-highlight text-text-secondary hover:border-primary/30 hover:text-primary"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-xs">
              {Object.values(filters).filter((v) => v && v !== "all").length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-text-secondary transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="brand-card bg-surface-highlight p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
                Intern
              </label>
              <select
                value={filters.intern}
                onChange={(e) =>
                  setFilters({ ...filters, intern: e.target.value })
                }
                className="input w-full text-sm"
              >
                <option value="">All Interns</option>
                {uniqueInterns.map((intern) => (
                  <option key={intern} value={intern}>
                    {intern}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
                Topic
              </label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) =>
                  setFilters({ ...filters, topic: e.target.value })
                }
                placeholder="Search topics..."
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
                Time Period
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
                className="input w-full text-sm"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {hasActiveFilters && (
        <p className="text-sm font-medium text-text-secondary">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </p>
      )}

      {/* Session History - Compact Cards */}
      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No sessions match your filters"
            description="Adjust the filters to see more completed sessions."
          />
        ) : (
          filteredSessions.map((session) => (
            <MentorHistoryCard
              key={session.id}
              session={session}
              isExpanded={expandedId === session.id}
              onToggle={() => toggleExpand(session.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ImpactCard({ icon, label, value }) {
  return (
    <div className="brand-card bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <p className="text-xs font-bold uppercase text-text-secondary">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-neutral-dark">{value}</p>
    </div>
  );
}

function MentorHistoryCard({ session, isExpanded, onToggle }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFocus = (focus) => {
    if (!focus) return "";
    return focus
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isTechnical = ["project_support", "technical_guidance"].includes(
    session.session_focus,
  );

  const hasNotes = session.notes;

  return (
    <div className="brand-card-hover bg-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-dark">
              {session.topic}
            </h3>
            {isTechnical && (
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                3x
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span className="truncate font-medium">{session.intern_name}</span>
            <span>-</span>
            <span>{formatDate(session.session_date)}</span>
            <span>-</span>
            <span className="truncate">{formatFocus(session.session_focus)}</span>
          </div>
        </div>
        
        {hasNotes && (
          <div className="shrink-0 text-text-secondary">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        )}
      </button>

      {isExpanded && hasNotes && (
        <div className="border-t border-border px-4 pb-3 pt-3">
          <p className="rounded-xl bg-surface-highlight p-3 text-sm text-text-secondary">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
}
