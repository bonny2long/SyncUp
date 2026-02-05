import React, { useMemo } from "react";
import { AgCharts } from "ag-charts-react";

const SKILL_COLORS = {
  react: "#4f46e5",
  "node.js": "#16a34a", 
  sql: "#dc2626",
  "api design": "#ea580c",
  "system design": "#0f766e",
  communication: "#7c3aed",
  debugging: "#0891b2",
  python: "#f59e0b",
  git: "#10b981",
  javascript: "#fbbf24",
  typescript: "#3b82f6",
  html: "#ef4444",
  css: "#06b6d4",
  "react native": "#8b5cf6",
  express: "#6366f1",
  mongodb: "#10b981",
  postgresql: "#3b82f6",
  docker: "#2493ef",
  aws: "#ff9900",
  testing: "#8b5cf6"
};

const getColorForSkill = (skillName) => {
  const normalizedName = skillName.toLowerCase().trim();
  return SKILL_COLORS[normalizedName] || "#6b7280";
};

const TeamSkillChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // Aggregate skill data across all team members
    const skillAggregates = {};
    
    data.forEach(item => {
      if (!item.skill_name || !item.signal_count) return;
      
      if (!skillAggregates[item.skill_name]) {
        skillAggregates[item.skill_name] = {
          skill_name: item.skill_name,
          total_signals: 0,
          total_weight: 0,
          members: new Set()
        };
      }
      
      skillAggregates[item.skill_name].total_signals += item.signal_count;
      skillAggregates[item.skill_name].total_weight += item.total_weight || 0;
      if (item.signal_count > 0) {
        skillAggregates[item.skill_name].members.add(item.user_id);
      }
    });

    return Object.values(skillAggregates)
      .filter(skill => skill.total_signals > 0)
      .sort((a, b) => b.total_weight - a.total_weight)
      .map(skill => ({
        skill: skill.skill_name,
        signals: skill.total_signals,
        weight: skill.total_weight,
        members: skill.members.size,
        fill: getColorForSkill(skill.skill_name)
      }));
  }, [data]);

  const options = useMemo(() => ({
    data: chartData,
    title: {
      text: "Team Skill Distribution",
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937"
    },
    subtitle: {
      text: "Most developed skills across the team",
      fontSize: 14,
      color: "#6b7280"
    },
    series: [
      {
        type: "bar",
        xKey: "skill",
        yKey: "weight",
        yName: "Skill Weight",
        fill: "#4f46e5",
        cornerRadius: 4,
        label: {
          enabled: true,
          position: "top",
          formatter: (params) => params.weight.toString()
        }
      }
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
        title: {
          text: "Skills",
          fontSize: 14,
          color: "#374151"
        },
        label: {
          rotation: -45,
          fontSize: 12,
          color: "#6b7280"
        }
      },
      {
        type: "number",
        position: "left",
        title: {
          text: "Total Weight",
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
      enabled: false
    },
    background: {
      visible: false
    },
    padding: {
      top: 20,
      right: 20,
      bottom: 80,
      left: 60
    }
  }), [chartData]);

  if (!chartData.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-gray-600 font-medium mb-2">No Skill Data Available</h3>
        <p className="text-gray-500 text-sm">
          Team members haven't generated any skill signals yet. Start collaborating on projects to see skill distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Skill Distribution</h3>
        <p className="text-sm text-gray-600">
          Most developed skills across your team based on accumulated signals
        </p>
      </div>
      <div className="h-80">
        <AgCharts options={options} />
      </div>
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{chartData.length}</p>
            <p className="text-xs text-gray-600">Total Skills</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, skill) => sum + skill.members, 0)}
            </p>
            <p className="text-xs text-gray-600">Skill Contributors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.max(...chartData.map(s => s.weight))}
            </p>
            <p className="text-xs text-gray-600">Top Skill Weight</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {chartData[0]?.skill || "N/A"}
            </p>
            <p className="text-xs text-gray-600">Leading Skill</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSkillChart;