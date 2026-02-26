import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers,
  fetchProjects,
  fetchSessions,
  fetchUpdates,
} from "../utils/api";
import { useUser } from "../context/UserContext";
import {
  Users,
  FolderKanban,
  GraduationCap,
  Zap,
  Bell,
  User,
  Flame,
  AlertTriangle,
  CheckCircle,
  Users2,
  Trophy,
  Activity,
  FileText,
  BarChart3,
  Settings,
  Server,
  Database,
  Clock,
  Cpu,
  Check,
  MoreHorizontal,
  Search,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    yellow: "text-yellow-500",
  };
  return (
    <div className="bg-surface rounded-xl p-5 border border-border hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-3">
        <span className={`${colorClasses[color] || "text-gray-400"}`}>
          <Icon size={24} />
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            color === "green" ? "bg-green-500"
            : color === "yellow" ? "bg-yellow-500"
            : color === "red" ? "bg-red-500"
            : "bg-blue-500"
          }`}
        ></span>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {subtext && <p className="text-xs text-green-500 mt-1">{subtext}</p>}
    </div>
  );
}

function ActivityItem({ icon: Icon, text, time, color }) {
  return (
    <div className="py-3 border-b border-border last:border-0 hover:bg-surface-highlight/30 px-2 rounded transition">
      <div className="flex items-center gap-3">
        <span className={color}>
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-primary truncate">{text}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ icon: Icon, text, count, severity }) {
  const severityColors = {
    critical: "border-l-red-500 bg-red-500/10",
    warning: "border-l-yellow-500 bg-yellow-500/10",
    info: "border-l-blue-500 bg-blue-500/10",
  };
  const iconColors = {
    critical: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };
  return (
    <div
      className={`p-3 rounded-r border-l-4 ${severityColors[severity]} mb-2`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconColors[severity]}>
            <Icon size={16} />
          </span>
          <span className="text-sm text-primary">{text}</span>
        </div>
        {count && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionMenu({ isOpen, onClose, actions }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-8 bg-surface border border-border rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => {
            action.onClick();
            onClose();
          }}
          className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-surface-highlight ${action.danger ? "text-red-500" : "text-primary"}`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout, impersonate } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    mentors: 0,
    sessions: 0,
    interns: 0,
    inactive: 0,
    activeProjects: 0,
    completedProjects: 0,
    seekingMembers: 0,
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, projectsData, sessionsData, updatesData] =
          await Promise.all([
            fetchUsers(),
            fetchProjects(),
            fetchSessions(),
            fetchUpdates(),
          ]);
        setUsers(usersData);
        setProjects(projectsData);
        setSessions(sessionsData);
        setUpdates(updatesData);

        // Calculate real stats
        const mentors = usersData.filter((u) => u.role === "mentor").length;
        const interns = usersData.filter((u) => u.role === "intern").length;
        const activeProjects = projectsData.filter(
          (p) => p.status === "active",
        ).length;
        const completedProjects = projectsData.filter(
          (p) => p.status === "completed",
        ).length;
        const seekingMembers =
          projectsData.filter((p) => p.status === "seeking_members").length ||
          0;

        setStats({
          users: usersData.length,
          projects: projectsData.length,
          mentors,
          interns,
          sessions: sessionsData.length,
          activeProjects,
          completedProjects,
          seekingMembers,
          inactive: 0, // Would need last_active timestamp to calculate
        });
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "projects", label: "Projects" },
    { id: "mentorship", label: "Mentorship" },
    { id: "system", label: "System" },
    { id: "settings", label: "Settings" },
  ];

  // Build activity from real updates data
  const recentActivity = updates.slice(0, 5).map((update) => ({
    icon: Activity,
    text: `${update.user_name || "Someone"}: ${update.content?.substring(0, 50) || "posted an update"}...`,
    time:
      update.created_at ?
        new Date(update.created_at).toLocaleDateString()
      : "Recently",
    color: "text-blue-400",
  }));

  // Alerts based on real data
  const alerts = [
    {
      icon: FileText,
      text: "Join Requests",
      count: stats.seekingMembers,
      severity: "info",
    },
    {
      icon: AlertTriangle,
      text: "Pending Sessions",
      count: sessions.filter((s) => s.status === "pending").length || 0,
      severity: "warning",
    },
    { icon: Zap, text: "Active Users", count: stats.users, severity: "info" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">
                SyncUp <span className="text-accent">Admin</span>
              </h1>
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                ADMIN PANEL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-surface-highlight rounded-full transition">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm text-gray-400">Admin</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-sm text-red-500 hover:text-red-400 px-3 py-1"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-surface border-b border-border px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id ?
                  "text-accent"
                : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.users}
                subtext={`${stats.mentors} mentors, ${stats.interns} interns`}
                color="blue"
              />
              <StatCard
                icon={FolderKanban}
                label="Active Projects"
                value={stats.activeProjects}
                subtext={`${stats.completedProjects} completed`}
                color="green"
              />
              <StatCard
                icon={GraduationCap}
                label="Active Mentors"
                value={stats.mentors}
                subtext={`${stats.sessions} sessions`}
                color="purple"
              />
              <StatCard
                icon={Zap}
                label="Total Updates"
                value={updates.length}
                subtext="All time"
                color="yellow"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Flame className="text-orange-500" size={20} /> Recent
                  Activity
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Latest updates from the platform
                </p>
                <div className="space-y-0">
                  {recentActivity.length > 0 ?
                    recentActivity.map((item, idx) => (
                      <ActivityItem key={idx} {...item} />
                    ))
                  : <p className="text-sm text-gray-500 py-4 text-center">
                      No recent activity
                    </p>
                  }
                </div>
                <button className="w-full mt-4 text-sm text-accent hover:underline">
                  View All Activity
                </button>
              </div>

              {/* Needs Attention */}
              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Needs
                  Attention
                </h3>
                <div className="space-y-2">
                  {alerts
                    .filter((a) => a.count > 0)
                    .map((alert, idx) => (
                      <AlertItem key={idx} {...alert} />
                    ))}
                  {alerts.filter((a) => a.count > 0).length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No items need attention
                    </p>
                  )}
                </div>
                <div className="mt-4 p-3 rounded bg-green-500/10 border-l-4 border-green-500 flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-4 h-4" />
                  <p className="text-sm text-green-400">
                    All systems operational
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Quick Actions
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
                >
                  <Users size={18} /> Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition flex items-center gap-2"
                >
                  <FolderKanban size={18} /> View Projects
                </button>
                <button
                  onClick={() => setActiveTab("system")}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition flex items-center gap-2"
                >
                  <BarChart3 size={18} /> System Health
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.users}
                color="blue"
              />
              <StatCard
                icon={User}
                label="Interns"
                value={stats.interns}
                color="green"
              />
              <StatCard
                icon={Trophy}
                label="Mentors"
                value={stats.mentors}
                color="purple"
              />
              <StatCard
                icon={Users2}
                label="Total"
                value={stats.users}
                color="yellow"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-primary">All Users</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-gray-500"
                  />
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Name
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Email
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Role
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ?
                    users.slice(0, 10).map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition"
                      >
                        <td className="p-3 text-sm text-gray-400">{user.id}</td>
                        <td className="p-3 text-sm text-primary font-medium">
                          {user.name}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {user.email || "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              user.role === "mentor" ?
                                "bg-purple-500/20 text-purple-400"
                              : user.role === "admin" ?
                                "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
                            <Check size={12} /> Active
                          </span>
                        </td>
                        <td className="p-3 relative">
                          <button
                            className="text-gray-400 hover:text-primary p-1"
                            onClick={() =>
                              setOpenMenu(
                                (
                                  openMenu?.type === "user" &&
                                    openMenu?.id === user.id
                                ) ?
                                  null
                                : { type: "user", id: user.id },
                              )
                            }
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {openMenu?.type === "user" &&
                            openMenu?.id === user.id && (
                              <ActionMenu
                                isOpen={true}
                                onClose={() => setOpenMenu(null)}
                                actions={[
                                  {
                                    icon: <User size={14} />,
                                    label: "View Dashboard",
                                    onClick: async () => {
                                      try {
                                        await impersonate(user);
                                        navigate("/collaboration");
                                      } catch (err) {
                                        console.error(
                                          "Impersonation failed:",
                                          err,
                                        );
                                        alert(
                                          "Failed to switch user. Please try again.",
                                        );
                                      }
                                    },
                                  },
                                  {
                                    icon: <Pencil size={14} />,
                                    label: "Edit User",
                                    onClick: () => setSelectedUser(user),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete User",
                                    danger: true,
                                    onClick: () => {
                                      if (
                                        confirm(`Delete user "${user.name}"?`)
                                      ) {
                                        setUsers(
                                          users.filter((u) => u.id !== user.id),
                                        );
                                      }
                                    },
                                  },
                                ]}
                              />
                            )}
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={FolderKanban}
                label="Total Projects"
                value={stats.projects}
                color="blue"
              />
              <StatCard
                icon={Check}
                label="Active"
                value={stats.activeProjects}
                color="green"
              />
              <StatCard
                icon={Search}
                label="Seeking Members"
                value={stats.seekingMembers}
                color="yellow"
              />
              <StatCard
                icon={Trophy}
                label="Completed"
                value={stats.completedProjects}
                color="purple"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-primary">All Projects</h3>
              </div>
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Title
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Owner
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Team
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ?
                    projects.slice(0, 10).map((project) => (
                      <tr
                        key={project.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition"
                      >
                        <td className="p-3 text-sm text-gray-400">
                          {project.id}
                        </td>
                        <td className="p-3 text-sm text-primary font-medium">
                          {project.name}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.owner_name || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.member_count || 1}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                            {project.status || "active"}
                          </span>
                        </td>
                        <td className="p-3 relative">
                          <button
                            className="text-gray-400 hover:text-primary p-1"
                            onClick={() =>
                              setOpenMenu(
                                (
                                  openMenu?.type === "project" &&
                                    openMenu?.id === project.id
                                ) ?
                                  null
                                : { type: "project", id: project.id },
                              )
                            }
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {openMenu?.type === "project" &&
                            openMenu?.id === project.id && (
                              <ActionMenu
                                isOpen={true}
                                onClose={() => setOpenMenu(null)}
                                actions={[
                                  {
                                    icon: <Eye size={14} />,
                                    label: "View Project",
                                    onClick: () => {},
                                  },
                                  {
                                    icon: <Pencil size={14} />,
                                    label: "Edit Project",
                                    onClick: () => setSelectedProject(project),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete Project",
                                    danger: true,
                                    onClick: () => {
                                      if (
                                        confirm(
                                          `Delete project "${project.name}"?`,
                                        )
                                      ) {
                                        setProjects(
                                          projects.filter(
                                            (p) => p.id !== project.id,
                                          ),
                                        );
                                      }
                                    },
                                  },
                                ]}
                              />
                            )}
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No projects found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "mentorship" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Clock}
                label="Total Sessions"
                value={sessions.length}
                color="blue"
              />
              <StatCard
                icon={GraduationCap}
                label="Active Mentors"
                value={stats.mentors}
                color="purple"
              />
              <StatCard
                icon={Activity}
                label="Completed"
                value={sessions.filter((s) => s.status === "completed").length}
                color="green"
              />
              <StatCard
                icon={Trophy}
                label="Pending"
                value={sessions.filter((s) => s.status === "pending").length}
                color="yellow"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-primary">Recent Sessions</h3>
              </div>
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Mentor
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Mentee
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Topic
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length > 0 ?
                    sessions.slice(0, 10).map((session) => (
                      <tr
                        key={session.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition"
                      >
                        <td className="p-3 text-sm text-gray-400">
                          {session.id}
                        </td>
                        <td className="p-3 text-sm text-primary">
                          {session.mentor_name || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {session.intern_name || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {session.topic || session.skill_name || "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              session.status === "completed" ?
                                "bg-green-500/20 text-green-400"
                              : session.status === "pending" ?
                                "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {session.status || "scheduled"}
                          </span>
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No sessions found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Cpu}
                label="Server CPU"
                value="45%"
                color="green"
              />
              <StatCard
                icon={Database}
                label="Database"
                value="Healthy"
                color="green"
              />
              <StatCard
                icon={Server}
                label="API Response"
                value="98ms"
                color="green"
              />
              <StatCard
                icon={Settings}
                label="Job Queue"
                value="5"
                color="green"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="text-accent" size={20} /> API Response
                Times (Last 24 Hours)
              </h3>
              <div className="h-48 bg-surface-highlight/30 rounded flex items-center justify-center text-gray-500">
                Chart placeholder - connect to real monitoring
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-surface rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
              <Settings className="text-accent" size={20} /> General Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="SyncUp"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  defaultValue="support@syncup.dev"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Timezone
                </label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary">
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                </select>
              </div>
              <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition flex items-center gap-2">
                <Check size={18} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
