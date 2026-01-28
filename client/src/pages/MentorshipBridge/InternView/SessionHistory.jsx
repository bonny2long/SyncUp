import React from "react";
import { Award, Calendar, Target, Zap } from "lucide-react";
import SkillBadge from "../../../components/shared/SkillBadge";

export default function SessionHistory({ sessions, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading session history...</p>
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
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No completed sessions yet
        </h3>
        <p className="text-sm text-gray-600">
          Complete your first mentorship session to start building your learning
          history!
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalSessions = sessions.length;
  const technicalSessions = sessions.filter((s) =>
    ["project_support", "technical_guidance"].includes(s.session_focus),
  ).length;

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
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Learning Timeline
        </h2>
        {sessions.map((session) => (
          <HistoryCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <p className="text-sm text-gray-600">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function HistoryCard({ session }) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{session.topic}</h3>
          <p className="text-sm text-gray-600">
            With:{" "}
            <span className="font-medium text-primary">
              {session.mentor_name}
            </span>
          </p>
        </div>
        {isTechnical && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3 h-3" />
            3x Weight
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(session.session_date)}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          {formatFocus(session.session_focus)}
        </span>
      </div>

      {session.details && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
          {session.details}
        </p>
      )}

      {session.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Session Notes:
          </p>
          <p className="text-sm text-gray-600">{session.notes}</p>
        </div>
      )}
    </div>
  );
}
