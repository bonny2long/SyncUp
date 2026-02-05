import React, { useMemo } from "react";
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📈</div>
        <h3 className="text-gray-600 font-medium mb-2">No Momentum Data Available</h3>
        <p className="text-gray-500 text-sm">
          Team activity data will appear here once team members start generating signals.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Momentum</h3>
        <p className="text-sm text-gray-600">
          Week-over-week growth trends and activity patterns
        </p>
      </div>
      
      <div className="h-80">
        <AgCharts options={options} />
      </div>

      {growthInsights && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {growthInsights.totalSignals}
              </p>
              <p className="text-xs text-gray-600">This Week's Signals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {growthInsights.totalWeight}
              </p>
              <p className="text-xs text-gray-600">This Week's Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {growthInsights.activeUsers}
              </p>
              <p className="text-xs text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${growthInsights.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {growthInsights.signalGrowth > 0 ? '+' : ''}{growthInsights.signalGrowth}%
              </p>
              <p className="text-xs text-gray-600">Signal Growth</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${growthInsights.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {growthInsights.weightGrowth > 0 ? '+' : ''}{growthInsights.weightGrowth}%
              </p>
              <p className="text-xs text-gray-600">Weight Growth</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMomentumChart;