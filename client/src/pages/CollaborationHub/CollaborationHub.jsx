import React, { useEffect, useState } from "react";
import ProjectList from "./ProjectList";
import ProgressFeed from "./ProgressFeed";
import {
  fetchProjects,
  fetchUpdates,
  fetchActiveProjectsAnalytics,
  fetchWeeklyUpdatesAnalytics,
  fetchMentorEngagementAnalytics,
} from "../../utils/api";

export default function CollaborationHub() {
  const [selectedProject, setSelectedProject] = useState(null); // { id, title } | null
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState("");
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [weeklyUpdates, setWeeklyUpdates] = useState([]);
  const [mentorEngagement, setMentorEngagement] = useState([]);

  useEffect(() => {
    async function loadMetrics() {
      setMetricsError("");
      try {
        const [projectsData, updatesData] = await Promise.all([
          fetchProjects(),
          fetchUpdates(),
        ]);
        setProjects(projectsData);
        setUpdates(updatesData);

        try {
          const [activeProjectsData, weeklyUpdatesData, mentorEngagementData] =
            await Promise.all([
              fetchActiveProjectsAnalytics(),
              fetchWeeklyUpdatesAnalytics(),
              fetchMentorEngagementAnalytics(),
            ]);
          setActiveProjectsCount(activeProjectsData.active_projects || 0);
          setWeeklyUpdates(weeklyUpdatesData || []);
          setMentorEngagement(mentorEngagementData || []);
        } catch (analyticsErr) {
          console.warn("Analytics fetch failed", analyticsErr);
        }
      } catch (err) {
        console.error("Error loading metrics:", err);
        setMetricsError("Unable to load metrics right now.");
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetrics();
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const updatesThisWeek = updates.filter((u) => {
    if (!u.created_at) return false;
    const created = new Date(u.created_at);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;
  const totalTeam = projects.reduce(
    (sum, p) => sum + (p.team_count ? Number(p.team_count) : 0),
    0
  );

  return (
    <section className="flex flex-col gap-4">
      {/* Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {loadingMetrics ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse"
            />
          ))
        ) : (
          <>
            <MetricCard
              title="Active Projects"
              value={activeProjectsCount}
              hint="Projects currently in flight"
              colorClass="text-primary"
            />
            <MetricCard
              title="Updates This Week"
              value={updatesThisWeek}
              hint="Fresh activity in the last 7 days"
              colorClass="text-secondary"
            />
            <MetricCard
              title="Total Team Members"
              value={totalTeam}
              hint="Across all listed projects"
              colorClass="text-accent"
            />
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Mentor Engagement</p>
              <div className="text-[11px] text-gray-600 space-y-1">
                {mentorEngagement.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex justify-between">
                    <span className="font-medium text-primary">{m.name}</span>
                    <span className="text-gray-500">
                      {m.completed_sessions || 0} / {m.total_sessions || 0} done
                    </span>
                  </div>
                ))}
                {mentorEngagement.length === 0 && (
                  <p className="text-gray-400">No mentor data</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {metricsError && (
        <p className="text-xs text-red-500">{metricsError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.6fr] gap-4">
        {/* LEFT SIDE - PROJECTS */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Projects</h2>

          <ProjectList
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            updatesData={updates}
          />
        </div>

        {/* RIGHT SIDE - TEAM UPDATES */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Team Updates
          </h2>

          <ProgressFeed
            selectedProjectId={selectedProject?.id || null}
            selectedProjectTitle={selectedProject?.title || ""}
            onClearProject={() => setSelectedProject(null)}
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, hint, colorClass = "text-primary" }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <div className={`text-2xl font-semibold ${colorClass}`}>{value}</div>
      <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
    </div>
  );
}
