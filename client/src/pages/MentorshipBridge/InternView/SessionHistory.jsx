import React, { useState, useMemo } from "react";
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Filter,
  X,
} from "lucide-react";

export default function SessionHistory({ sessions, loading, error }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mentor: "",
    topic: "",
    dateRange: "all",
  });

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const clearFilters = () => {
    setFilters({ mentor: "", topic: "", dateRange: "all" });
  };

  const hasActiveFilters = filters.mentor || filters.topic || filters.dateRange !== "all";

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filters.mentor && session.mentor_name !== filters.mentor) return false;
      if (filters.topic && !session.topic.toLowerCase().includes(filters.topic.toLowerCase())) return false;
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

  // Get unique mentors for filter dropdown
  const uniqueMentors = useMemo(() => {
    return [...new Set(sessions.map((s) => s.mentor_name))];
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-text-secondary">
          Loading session history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-dark mb-2">
          No completed sessions yet
        </h3>
        <p className="text-sm text-text-secondary">
          Complete your first mentorship session to start building your learning
          history!
        </p>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const technicalSessions = sessions.filter((s) =>
    ["project_support", "technical_guidance"].includes(s.session_focus),
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Award className="w-4 h-4" />}
          label="Total"
          value={totalSessions}
          color="text-primary"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Technical"
          value={technicalSessions}
          color="text-secondary"
        />
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Career"
          value={totalSessions - technicalSessions}
          color="text-accent"
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="This Month"
          value={filteredSessions.length}
          color="text-green-500"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
            showFilters || hasActiveFilters
              ? "bg-primary text-white"
              : "bg-surface-highlight text-text-secondary hover:text-neutral-dark"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {Object.values(filters).filter(v => v && v !== "all").length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-500"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface-highlight border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mentor Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Mentor
              </label>
              <select
                value={filters.mentor}
                onChange={(e) => setFilters({ ...filters, mentor: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              >
                <option value="">All Mentors</option>
                {uniqueMentors.map((mentor) => (
                  <option key={mentor} value={mentor}>{mentor}</option>
                ))}
              </select>
            </div>

            {/* Topic Search */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Topic
              </label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                placeholder="Search topics..."
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Time Period
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
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
        <p className="text-sm text-text-secondary">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </p>
      )}

      {/* Session Timeline - Compact Cards */}
      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 bg-surface-highlight rounded-lg">
            <p className="text-text-secondary text-sm">
              No sessions match your filters
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <HistoryCard
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

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-surface p-3 rounded-lg border border-border">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
      <p className="text-2xl font-bold text-neutral-dark">{value}</p>
    </div>
  );
}

function HistoryCard({ session, isExpanded, onToggle }) {
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

  const hasDetails = session.details || session.notes;

  return (
    <div className="bg-surface border border-border rounded-lg hover:border-primary/30 transition-colors">
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2"
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-neutral-dark text-sm truncate">
                {session.topic}
              </h3>
              {isTechnical && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 flex items-center gap-0.5 shrink-0">
                  <Zap className="w-2.5 h-2.5" />
                  3x
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
              <span className="font-medium text-primary truncate">
                {session.mentor_name}
              </span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">{formatDate(session.session_date)}</span>
              {session.session_focus && (
                <>
                  <span className="shrink-0">•</span>
                  <span className="truncate">{formatFocus(session.session_focus)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {hasDetails && (
          <div className="shrink-0 text-text-secondary">
            {isExpanded ?
              <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && hasDetails && (
        <div className="px-3 pb-2.5 border-t border-border pt-2 space-y-2">
          {session.details && (
            <p className="text-xs text-text-secondary bg-surface-highlight p-2 rounded">
              {session.details}
            </p>
          )}
          {session.notes && (
            <div>
              <p className="text-[10px] font-semibold text-text-secondary mb-1">
                Notes:
              </p>
              <p className="text-xs text-text-secondary">{session.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
