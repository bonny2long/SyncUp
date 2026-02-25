import React, { useMemo } from "react";
import { TrendingUp, LineChart, FileText, Zap } from "lucide-react";
import { AgCharts } from "ag-charts-react";

// Helper function to format week numbers to readable dates
const weekLabelFromYearWeek = (yearWeek) => {
  if (!yearWeek) return "Unknown";
  
  const year = parseInt(yearWeek.toString().slice(0, 4));
  const week = parseInt(yearWeek.toString().slice(-2));
  
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  
  return weekStart.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const TeamMomentumChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      week: weekLabelFromYearWeek(item.week),
      signals: parseInt(item.signals) || 0,
      weight: parseInt(item.total_weight) || 0,
      activeUsers: parseInt(item.active_users) || 0,
      weekNumber: item.week
    })).sort((a, b) => a.weekNumber - b.weekNumber);
  }, [data]);

  const options = useMemo(() => ({
    data: chartData,
    title: {
      text: "Team Momentum Trend",
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937"
    },
    subtitle: {
      text: "Week-over-week growth patterns (last 4 weeks)",
      fontSize: 14,
      color: "#6b7280"
    },
    series: [
      {
        type: "line",
        xKey: "week",
        yKey: "signals",
        yName: "Signals",
        stroke: "#4f46e5",
        strokeWidth: 3,
        marker: {
          enabled: true,
          size: 6,
          fill: "#4f46e5",
          stroke: "#ffffff",
          strokeWidth: 2
        },
        tooltip: {
          enabled: true,
          renderer: (params) => ({
            title: `Week of ${params.xValue}`,
            content: [
              { label: "Signals", value: params.yValue },
              { label: "Weight", value: chartData.find(d => d.week === params.xValue)?.weight || 0 },
              { label: "Active Users", value: chartData.find(d => d.week === params.xValue)?.activeUsers || 0 }
            ]
          })
        }
      },
      {
        type: "line",
        xKey: "week",
        yKey: "weight",
        yName: "Weight",
        stroke: "#16a34a",
        strokeWidth: 3,
        marker: {
          enabled: true,
          size: 6,
          fill: "#16a34a",
          stroke: "#ffffff",
          strokeWidth: 2
        }
      }
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
        title: {
          text: "Week",
          fontSize: 14,
          color: "#374151"
        },
        label: {
          fontSize: 12,
          color: "#6b7280"
        }
      },
      {
        type: "number",
        position: "left",
        title: {
          text: "Count / Weight",
          fontSize: 14,
          color: "#374151"
        },
        label: {
          fontSize: 12,
          color: "#6b7280"
        }
      }
    ],
    legend: {
      enabled: true,
      position: "bottom",
      item: {
        fontSize: 12,
        color: "#374151"
      }
    },
    background: {
      visible: false
    },
    padding: {
      top: 20,
      right: 20,
      bottom: 60,
      left: 60
    }
  }), [chartData]);

  // Calculate growth insights
  const growthInsights = useMemo(() => {
    if (chartData.length < 2) return null;

    const recent = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    
    const signalGrowth = previous.signals > 0 
      ? ((recent.signals - previous.signals) / previous.signals * 100).toFixed(1)
      : 0;
    
    const weightGrowth = previous.weight > 0
      ? ((recent.weight - previous.weight) / previous.weight * 100).toFixed(1)
      : 0;

    return {
      signalGrowth,
      weightGrowth,
      isPositive: parseFloat(signalGrowth) > 0 || parseFloat(weightGrowth) > 0,
      totalSignals: recent.signals,
      totalWeight: recent.weight,
      activeUsers: recent.activeUsers
    };
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="bg-surface dark:bg-surface-highlight border border-border dark:border-gray-700 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-surface-highlight dark:bg-gray-800">
          <LineChart className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-neutral-dark dark:text-white font-semibold text-lg mb-2">No Momentum Data Yet</h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
          Team activity and progress will be tracked here once members start posting updates.
        </p>
        <div className="flex flex-col items-center gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Post regular project updates</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Stay active to build momentum</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-surface-highlight border border-border dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-2">Team Momentum</h3>
        <p className="text-sm text-text-secondary">
          Week-over-week growth trends and activity patterns
        </p>
      </div>
      
      <div className="h-80">
        <AgCharts options={options} />
      </div>

      {growthInsights && (
        <div className="mt-6 p-4 bg-neutralLight dark:bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {growthInsights.totalSignals}
              </p>
              <p className="text-xs text-text-secondary">This Week's Signals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {growthInsights.totalWeight}
              </p>
              <p className="text-xs text-text-secondary">This Week's Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {growthInsights.activeUsers}
              </p>
              <p className="text-xs text-text-secondary">Active Users</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${growthInsights.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {growthInsights.signalGrowth > 0 ? '+' : ''}{growthInsights.signalGrowth}%
              </p>
              <p className="text-xs text-text-secondary">Signal Growth</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${growthInsights.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {growthInsights.weightGrowth > 0 ? '+' : ''}{growthInsights.weightGrowth}%
              </p>
              <p className="text-xs text-text-secondary">Weight Growth</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMomentumChart;