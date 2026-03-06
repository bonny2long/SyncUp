import React, { useState, useMemo } from "react";
import { Award, Users, Zap, TrendingUp, Filter, X, ChevronDown, ChevronUp } from "lucide-react";

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

  const hasActiveFilters = filters.intern || filters.topic || filters.dateRange !== "all";

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filters.intern && session.intern_name !== filters.intern) return false;
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

  // Get unique interns for filter dropdown
  const uniqueInterns = useMemo(() => {
    return [...new Set(sessions.map((s) => s.intern_name))];
  }, [sessions]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
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
          Your mentorship impact will be tracked here once you complete sessions
        </p>
      </div>
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
    <div className="space-y-4">
      {/* Impact Stats - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ImpactCard
          icon={<Award className="w-4 h-4" />}
          label="Total"
          value={totalSessions}
          color="text-primary"
        />
        <ImpactCard
          icon={<Users className="w-4 h-4" />}
          label="Interns"
          value={uniqueInternsCount}
          color="text-secondary"
        />
        <ImpactCard
          icon={<Zap className="w-4 h-4" />}
          label="Technical"
          value={technicalSessions}
          color="text-accent"
        />
        <ImpactCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Requests"
          value={totalRequests}
          color="text-green-600"
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
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface-highlight border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Intern</label>
              <select
                value={filters.intern}
                onChange={(e) => setFilters({ ...filters, intern: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
              >
                <option value="">All Interns</option>
                {uniqueInterns.map((intern) => (
                  <option key={intern} value={intern}>{intern}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Topic</label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                placeholder="Search topics..."
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Time Period</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
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

      {/* Session History - Compact Cards */}
      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 bg-surface-highlight rounded-lg">
            <p className="text-text-secondary text-sm">No sessions match your filters</p>
          </div>
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

function ImpactCard({ icon, label, value, color }) {
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
    <div className="bg-surface border border-border rounded-lg hover:border-primary/30 transition-colors">
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-neutral-dark text-sm truncate">
              {session.topic}
            </h3>
            {isTechnical && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 shrink-0">
                3x
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
            <span className="font-medium truncate">{session.intern_name}</span>
            <span>•</span>
            <span>{formatDate(session.session_date)}</span>
            <span>•</span>
            <span className="truncate">{formatFocus(session.session_focus)}</span>
          </div>
        </div>
        
        {hasNotes && (
          <div className="shrink-0 text-text-secondary">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      {isExpanded && hasNotes && (
        <div className="px-3 pb-2.5 border-t border-border pt-2">
          <p className="text-xs text-text-secondary bg-surface-highlight p-2 rounded">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
}
