import React from "react";

const TeamOverview = ({ data }) => {
  const formatNumber = (num) => {
    return num ? parseInt(num).toLocaleString() : "0";
  };

  const getGrowthRate = () => {
    if (!data || !data.weekly_signals || !data.total_signals) return "N/A";
    const weeklyRate = (data.weekly_signals / data.total_signals) * 100;
    return `${weeklyRate.toFixed(1)}%`;
  };

  const metrics = [
    {
      label: "Skills Tracked",
      value: formatNumber(data?.skills_tracked),
      icon: "🎯",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700"
    },
    {
      label: "Team Size", 
      value: formatNumber(data?.team_size),
      icon: "👥",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700"
    },
    {
      label: "Active This Week",
      value: formatNumber(data?.active_this_week),
      icon: "🔥",
      color: "bg-orange-50 border-orange-200", 
      textColor: "text-orange-700"
    },
    {
      label: "Total Signals",
      value: formatNumber(data?.total_signals),
      icon: "📈",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.color} border rounded-lg p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {metric.label}
              </p>
              <p className={`text-2xl font-bold ${metric.textColor}`}>
                {metric.value}
              </p>
            </div>
            <div className="text-2xl">
              {metric.icon}
            </div>
          </div>
          {metric.label === "Active This Week" && data?.weekly_signals > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Growth rate: {getGrowthRate()}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamOverview;