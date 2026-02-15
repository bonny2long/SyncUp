import React, { useState } from "react";
import { Target, Users, TrendingUp, BarChart3, X } from "lucide-react";

const TeamOverview = ({
  data,
  teamMembers = [],
  activeThisWeek = [],
  signalBreakdown = [],
  skillDistribution = [],
}) => {
  const [modalType, setModalType] = useState(null);

  const formatNumber = (num) => {
    return num ? parseInt(num).toLocaleString() : "0";
  };

  const getGrowthRate = () => {
    if (!data || !data.weekly_signals || !data.total_signals) return "N/A";
    const weeklyRate = (data.weekly_signals / data.total_signals) * 100;
    return `${weeklyRate.toFixed(1)}%`;
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

  const getSourceLabel = (source) => {
    switch (source) {
      case "project":
        return "Project";
      case "update":
        return "Updates";
      case "mentorship":
        return "Mentorship";
      default:
        return source;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case "project":
        return "bg-blue-100 text-blue-700";
      case "update":
        return "bg-green-100 text-green-700";
      case "mentorship":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const metrics = [
    {
      label: "Skills Tracked",
      value: formatNumber(data?.skills_tracked),
      icon: <Target className="w-4 h-4" />,
      color: "bg-surface border-blue-200/30",
      textColor: "text-blue-500",
      onClick: () => setModalType("skills"),
    },
    {
      label: "Team Size",
      value: formatNumber(data?.team_size),
      icon: <Users className="w-4 h-4" />,
      color: "bg-surface border-green-200/30",
      textColor: "text-green-500",
      onClick: () => setModalType("team"),
    },
    {
      label: "Active This Week",
      value: formatNumber(data?.active_this_week),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-surface border-orange-200/30",
      textColor: "text-orange-500",
      onClick: () => setModalType("active"),
    },
    {
      label: "Total Signals",
      value: formatNumber(data?.total_signals),
      icon: <BarChart3 className="w-4 h-4" />,
      color: "bg-surface border-purple-200/30",
      textColor: "text-purple-500",
      onClick: () => setModalType("signals"),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <button
            key={index}
            onClick={metric.onClick}
            className={`${metric.color} border rounded-lg p-3 transition-all hover:shadow-md hover:scale-[1.02] text-left cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary mb-0.5">
                  {metric.label}
                </p>
                <p className={`text-xl font-bold ${metric.textColor}`}>
                  {metric.value}
                </p>
              </div>
              <div className="flex items-center justify-center">
                {metric.icon}
              </div>
            </div>
            {metric.label === "Active This Week" &&
              data?.weekly_signals > 0 && (
                <div className="mt-1">
                  <span className="text-[10px] text-text-secondary">
                    Growth: {getGrowthRate()}
                  </span>
                </div>
              )}
          </button>
        ))}
      </div>

      {/* Modal */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-neutral-dark">
                {modalType === "team" && "Team Members"}
                {modalType === "skills" && "Skills Tracked"}
                {modalType === "active" && "Active This Week"}
                {modalType === "signals" && "Signal Breakdown"}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 rounded-full hover:bg-surface-highlight text-text-secondary hover:text-neutral-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {/* Team Members Modal */}
              {modalType === "team" && (
                <div className="space-y-3">
                  {teamMembers.length === 0 ?
                    <p className="text-text-secondary text-center py-4">
                      No team members
                    </p>
                  : teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-full text-primary font-semibold text-sm">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-dark">
                              {member.name}
                            </p>
                            <span className="text-xs uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-neutral-dark">
                            {formatNumber(member.total_signals)}
                          </p>
                          <p className="text-xs text-text-secondary">signals</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Skills Tracked Modal */}
              {modalType === "skills" && (
                <div className="space-y-2">
                  {skillDistribution.length === 0 ?
                    <p className="text-text-secondary text-center py-4">
                      No skills tracked
                    </p>
                  : <>
                      {/* Group by skill */}
                      {Object.entries(
                        skillDistribution.reduce((acc, item) => {
                          if (!acc[item.skill_name])
                            acc[item.skill_name] = {
                              count: 0,
                              weight: 0,
                              users: new Set(),
                            };
                          acc[item.skill_name].count += item.signal_count || 0;
                          acc[item.skill_name].weight += item.total_weight || 0;
                          acc[item.skill_name].users.add(item.name);
                          return acc;
                        }, {}),
                      )
                        .sort((a, b) => b[1].weight - a[1].weight)
                        .map(([skillName, data]) => (
                          <div
                            key={skillName}
                            className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-border"
                          >
                            <div>
                              <p className="font-medium text-neutral-dark">
                                {skillName}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {data.users.size} contributor
                                {data.users.size !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-neutral-dark">
                                {data.weight}
                              </p>
                              <p className="text-xs text-text-secondary">
                                weight
                              </p>
                            </div>
                          </div>
                        ))}
                    </>
                  }
                </div>
              )}

              {/* Active This Week Modal */}
              {modalType === "active" && (
                <div className="space-y-3">
                  {activeThisWeek.length === 0 ?
                    <p className="text-text-secondary text-center py-4">
                      No activity this week
                    </p>
                  : activeThisWeek.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 flex items-center justify-center rounded-full text-orange-600 font-semibold text-sm">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-dark">
                              {user.name}
                            </p>
                            <span className="text-xs uppercase tracking-wide bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-orange-600">
                            {user.signal_count}
                          </p>
                          <p className="text-xs text-text-secondary">signals</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Signal Breakdown Modal */}
              {modalType === "signals" && (
                <div className="space-y-3">
                  {(
                    signalBreakdown.length === 0 ||
                    signalBreakdown.every((s) => s.count === 0)
                  ) ?
                    <p className="text-text-secondary text-center py-4">
                      No signals yet
                    </p>
                  : signalBreakdown.map((item) => (
                      <div
                        key={item.source}
                        className="flex items-center justify-between p-4 bg-surface-highlight rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(item.source)}`}
                          >
                            {getSourceLabel(item.source)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-neutral-dark">
                            {item.count}
                          </p>
                          <p className="text-xs text-text-secondary">
                            signals · {item.weight} weight
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamOverview;
