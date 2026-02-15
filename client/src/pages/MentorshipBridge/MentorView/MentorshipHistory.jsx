import React from "react";
import { Award, Users, Zap, TrendingUp } from "lucide-react";

export default function MentorshipHistory({
  sessions,
  allSessions,
  loading,
  error,
}) {
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
  const uniqueInterns = new Set(sessions.map((s) => s.intern_id)).size;
  const technicalSessions = sessions.filter((s) =>
    ["project_support", "technical_guidance"].includes(s.session_focus),
  ).length;
  const totalRequests = allSessions.length;

  return (
    <div className="space-y-6">
      {/* Impact Stats */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-dark mb-4">
          Your Mentorship Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ImpactCard
            icon={<Award className="w-5 h-5" />}
            label="Total Sessions"
            value={totalSessions}
            color="text-primary"
          />
          <ImpactCard
            icon={<Users className="w-5 h-5" />}
            label="Interns Mentored"
            value={uniqueInterns}
            color="text-secondary"
          />
          <ImpactCard
            icon={<Zap className="w-5 h-5" />}
            label="Technical Sessions"
            value={technicalSessions}
            color="text-accent"
          />
          <ImpactCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total Requests"
            value={totalRequests}
            color="text-green-600"
          />
        </div>
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-dark mb-4">
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {sessions.slice(0, 10).map((session) => (
            <HistoryCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ icon, label, value, color }) {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border hover:shadow-md transition">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
      <p className="text-3xl font-bold text-neutral-dark">{value}</p>
    </div>
  );
}

function HistoryCard({ session }) {
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

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-dark">{session.topic}</h3>
          <p className="text-sm text-text-secondary mt-1">
            With: <span className="font-medium">{session.intern_name}</span>
          </p>
        </div>
        {isTechnical && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            3x
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <span>{formatDate(session.session_date)}</span>
        <span>•</span>
        <span>{formatFocus(session.session_focus)}</span>
      </div>

      {session.notes && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-text-secondary">{session.notes}</p>
        </div>
      )}
    </div>
  );
}
