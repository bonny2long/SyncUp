import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
        return "bg-[#b9123f]/10 text-[#b9123f]";
      case "update":
        return "bg-[#b9123f]/10 text-[#b9123f]";
      case "mentorship":
        return "bg-[#383838]/10 text-[#383838]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const metrics = [
    {
      label: "Skills Tracked",
      value: formatNumber(data?.skills_tracked),
      icon: <Target className="w-4 h-4" />,
      color: "bg-surface border-[#b9123f]/20",
      textColor: "text-[#b9123f]",
      onClick: () => setModalType("skills"),
    },
    {
      label: "Team Size",
      value: formatNumber(data?.team_size),
      icon: <Users className="w-4 h-4" />,
      color: "bg-surface border-[#383838]/20",
      textColor: "text-[#383838]",
      onClick: () => setModalType("team"),
    },
    {
      label: "Active This Week",
      value: formatNumber(data?.active_this_week),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-surface border-[#b9123f]/20",
      textColor: "text-[#b9123f]",
      onClick: () => setModalType("active"),
    },
    {
      label: "Total Signals",
      value: formatNumber(data?.total_signals),
      icon: <BarChart3 className="w-4 h-4" />,
      color: "bg-surface border-[#383838]/20",
      textColor: "text-[#383838]",
      onClick: () => setModalType("signals"),
    },
  ];

  const getModalConfig = (type) => {
    switch (type) {
      case "team":
        return {
          icon: Users,
          title: "Team Members",
          summary: `${teamMembers.length} member${teamMembers.length === 1 ? "" : "s"}`,
          emptyTitle: "No team members yet",
          emptyDescription: "Members will appear here once they join this project.",
        };
      case "skills":
        return {
          icon: Target,
          title: "Skills Tracked",
          summary: `${skillDistribution.length} skill signal${skillDistribution.length === 1 ? "" : "s"}`,
          emptyTitle: "No skills tracked yet",
          emptyDescription: "Ask the team to tag project updates with skills to build this view.",
        };
      case "active":
        return {
          icon: TrendingUp,
          title: "Active This Week",
          summary: `${activeThisWeek.length} active member${activeThisWeek.length === 1 ? "" : "s"}`,
          emptyTitle: "No activity this week",
          emptyDescription: "Recent project updates and signals will show here.",
        };
      case "signals":
      default:
        return {
          icon: BarChart3,
          title: "Signal Breakdown",
          summary: `${formatNumber(data?.total_signals)} total signals`,
          emptyTitle: "No signals yet",
          emptyDescription: "Signals will appear once the team posts updates, project work, or mentorship activity.",
        };
    }
  };

  const renderModalEmpty = (config) => {
    const EmptyIcon = config.icon;
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-highlight px-8 py-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <EmptyIcon className="h-7 w-7" />
        </div>
        <h4 className="text-lg font-black text-neutral-dark">
          {config.emptyTitle}
        </h4>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
          {config.emptyDescription}
        </p>
      </div>
    );
  };

  const modalConfig = modalType ? getModalConfig(modalType) : null;
  const ModalIcon = modalConfig?.icon;

  useEffect(() => {
    if (!modalType) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalType]);

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
      {modalType && modalConfig && ModalIcon &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setModalType(null)}
        >
          <div
            className="flex h-[min(760px,calc(100vh-48px))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ModalIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-dark">
                    {modalConfig.title}
                  </h3>
                  <p className="text-xs font-semibold uppercase text-text-secondary">
                    {modalConfig.summary}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-full p-2 text-text-secondary transition hover:bg-surface-highlight hover:text-primary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Team Members Modal */}
              {modalType === "team" && (
                <div className="space-y-3">
                  {teamMembers.length === 0 ?
                    renderModalEmpty(modalConfig)
                  : teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-highlight p-4"
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
                    renderModalEmpty(modalConfig)
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
                            className="flex items-center justify-between rounded-xl border border-border bg-surface-highlight p-4"
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
                    renderModalEmpty(modalConfig)
                  : activeThisWeek.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-highlight p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full text-primary font-semibold text-sm">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-dark">
                              {user.name}
                            </p>
                            <span className="text-xs uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
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
                    renderModalEmpty(modalConfig)
                  : signalBreakdown.map((item) => (
                      <div
                        key={item.source}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-highlight p-4"
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
                            signals - {item.weight} weight
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default TeamOverview;
