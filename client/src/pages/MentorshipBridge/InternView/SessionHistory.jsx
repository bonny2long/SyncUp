import React, { useState } from "react";
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
} from "lucide-react";

export default function SessionHistory({ sessions, loading, error }) {
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Total Sessions"
          value={totalSessions}
          color="text-primary"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Technical Sessions"
          value={technicalSessions}
          color="text-secondary"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Career Guidance"
          value={totalSessions - technicalSessions}
          color="text-accent"
        />
      </div>

      {/* Session Timeline */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-dark">
          Learning Timeline
        </h2>
        {sessions.map((session) => (
          <HistoryCard
            key={session.id}
            session={session}
            isExpanded={expandedId === session.id}
            onToggle={() => toggleExpand(session.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
      <p className="text-3xl font-bold text-neutral-dark">{value}</p>
    </div>
  );
}

function HistoryCard({ session, isExpanded, onToggle }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
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
        className="w-full text-left p-4 flex items-center justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-neutral-dark truncate">
              {session.topic}
            </h3>
            {isTechnical && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 flex items-center gap-1 whitespace-nowrap shrink-0">
                <Zap className="w-3 h-3" />
                3x Weight
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary flex-wrap">
            <span className="font-medium text-primary">
              {session.mentor_name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(session.session_date)}
            </span>
            {session.session_focus && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {formatFocus(session.session_focus)}
              </span>
            )}
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
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {session.details && (
            <p className="text-sm text-text-secondary bg-surface-highlight p-3 rounded">
              {session.details}
            </p>
          )}
          {session.notes && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-1">
                Session Notes:
              </p>
              <p className="text-sm text-text-secondary">{session.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
