import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AgCharts } from "ag-charts-react";
import { useToast } from "../context/ToastContext";
import {
  fetchUsers,
  fetchProjects,
  fetchSessions,
  fetchUpdates,
  deleteUser,
  updateUser,
  deleteProject,
  updateProjectStatus,
  fetchHealth,
  fetchActiveProjectsAnalytics,
  fetchErrors,
  fetchErrorStats,
  fetchRecentErrors,
  updateErrorStatus,
  deleteError,
  fetchAdminStats,
  fetchActiveSessions,
  fetchPlatformStats,
  fetchGrowthStats,
} from "../utils/api";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import HelpModal from "../components/shared/HelpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
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
  Check,
  MoreHorizontal,
  Search,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Trash2,
  X,
  Menu,
  Moon,
  Sun,
  Download,
  ChevronRight,
  HelpCircle,
  Info,
  ExternalLink,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  File,
  Archive,
  Medal,
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

function AlertItem({ icon: Icon, text, count, severity, onClick }) {
  const severityColors = {
    critical: "border-l-red-500 bg-red-500/10",
    warning: "border-l-yellow-500 bg-yellow-500/10",
    info: "border-l-blue-500 bg-blue-500/10",
    error: "border-l-red-500 bg-red-500/10",
  };
  const iconColors = {
    critical: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    error: "text-red-500",
  };
  return (
    <div
      className={`p-3 rounded-r border-l-4 ${severityColors[severity]} mb-2 ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconColors[severity]}>
            <Icon size={16} />
          </span>
          <span className="text-sm text-primary">{text}</span>
        </div>
        {count !== undefined && count !== null && (
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
  const { user, logout } = useUser();
  const { addToast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const menuRef = useRef(null);
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
  const [selectedError, setSelectedError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: () => {} });
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilters, setUserFilters] = useState({ role: "all", status: "all" });
  const [userPagination, setUserPagination] = useState({ page: 1, perPage: 10 });
  const [projectFilters, setProjectFilters] = useState({ status: "all" });
  const [projectPagination, setProjectPagination] = useState({ page: 1, perPage: 10 });
  const [healthData, setHealthData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [errorStats, setErrorStats] = useState({ total: 0, open: 0, byType: [] });
  const [errors, setErrors] = useState([]);
  const [errorsPagination, setErrorsPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [errorFilter, setErrorFilter] = useState({ status: "all", type: "all" });
  const [activeSessions, setActiveSessions] = useState(0);
  const [adminStats, setAdminStats] = useState({ inactiveUsers: 0 });
  const [platformStats, setPlatformStats] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [settings, setSettings] = useState({
    platformName: "SyncUp",
    supportEmail: "support@syncup.com",
    timezone: "UTC",
    allowRegistrations: true,
  });
  const [featureFlags, setFeatureFlags] = useState({
    enableMentorship: true,
    enableProjectDiscovery: true,
    maintenanceMode: false,
    showLeaderboards: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [
          usersData,
          projectsData,
          sessionsData,
          updatesData,
          health,
          analytics,
          errorStatsData,
          adminStatsData,
          activeSessionsData,
          platformStatsData,
          recentErrorsData,
          growthDataResult,
        ] = await Promise.all([
          fetchUsers(),
          fetchProjects(),
          fetchSessions(),
          fetchUpdates(),
          fetchHealth().catch(() => null),
          fetchActiveProjectsAnalytics().catch(() => null),
          fetchErrorStats().catch(() => ({ total: 0, open: 0, byType: [] })),
          fetchAdminStats().catch(() => ({ inactiveUsers: 0 })),
          fetchActiveSessions().catch(() => ({ activeSessions: 0 })),
          fetchPlatformStats().catch(() => null),
          fetchRecentErrors().catch(() => []),
          fetchGrowthStats().catch(() => []),
        ]);
        setUsers(usersData);
        setProjects(projectsData);
        setSessions(sessionsData);
        setUpdates(updatesData);
        setHealthData(health);
        setAnalyticsData(analytics);
        setErrorStats(errorStatsData);
        setAdminStats(adminStatsData);
        setActiveSessions(activeSessionsData?.activeSessions || 0);
        setPlatformStats(platformStatsData);
        setRecentErrors(recentErrorsData || []);
        setGrowthData(growthDataResult || []);

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
          inactive: adminStatsData?.inactiveUsers || 0,
        });
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle click outside for menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "projects", label: "Projects" },
    { id: "mentorship", label: "Mentorship" },
    { id: "errors", label: "Errors" },
    { id: "system", label: "System" },
    { id: "settings", label: "Settings" },
  ];

  // Load errors when Errors tab is active
  const loadErrors = async (page = 1) => {
    try {
      const data = await fetchErrors(errorFilter.status, errorFilter.type, page, 15);
      setErrors(data.errors || []);
      setErrorsPagination(data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error("Failed to load errors:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "errors") {
      loadErrors();
    }
  }, [activeTab, errorFilter]);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = userFilters.role === "all" || user.role === userFilters.role;
    const matchesStatus = userFilters.status === "all" || 
      (userFilters.status === "active" && user.is_active !== false) ||
      (userFilters.status === "inactive" && user.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    (userPagination.page - 1) * userPagination.perPage,
    userPagination.page * userPagination.perPage
  );
  const totalUserPages = Math.ceil(filteredUsers.length / userPagination.perPage);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(project.owner_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = projectFilters.status === "all" || project.status === projectFilters.status;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate projects
  const paginatedProjects = filteredProjects.slice(
    (projectPagination.page - 1) * projectPagination.perPage,
    projectPagination.page * projectPagination.perPage
  );
  const totalProjectPages = Math.ceil(filteredProjects.length / projectPagination.perPage);

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    setConfirmModal({
      open: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          setUsers(users.filter((u) => u.id !== userId));
          addToast("User deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete user:", err);
          addToast("Failed to delete user. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Handle update user
  const handleUpdateUser = async (userId, data) => {
    try {
      await updateUser(userId, data);
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...data } : u)));
      setSelectedUser(null);
      addToast("User updated successfully", "success");
    } catch (err) {
      console.error("Failed to update user:", err);
      addToast("Failed to update user. Please try again.", "error");
    }
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    setConfirmModal({
      open: true,
      title: "Delete Project",
      message: "Are you sure you want to delete this project? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteProject(projectId);
          setProjects(projects.filter((p) => p.id !== projectId));
          addToast("Project deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete project:", err);
          addToast("Failed to delete project. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Handle update project status
  const handleUpdateProjectStatus = async (projectId, status) => {
    try {
      await updateProjectStatus(projectId, status);
      setProjects(
        projects.map((p) => (p.id === projectId ? { ...p, status } : p))
      );
      setSelectedProject(null);
      addToast(`Project status updated to ${status}`, "success");
    } catch (err) {
      console.error("Failed to update project:", err);
      addToast("Failed to update project. Please try again.", "error");
    }
  };

  // Handle settings save
  const handleSaveSettings = async () => {
    try {
      addToast("Settings saved successfully", "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      addToast("Failed to save settings. Please try again.", "error");
    }
  };

  // Handle error status update
  const handleErrorStatusUpdate = async (errorId, status) => {
    try {
      await updateErrorStatus(errorId, status, user?.id);
      loadErrors(errorsPagination.page);
      // Refresh error stats
      const stats = await fetchErrorStats();
      setErrorStats(stats);
      addToast(`Error marked as ${status}`, "success");
    } catch (err) {
      console.error("Failed to update error:", err);
      addToast("Failed to update error. Please try again.", "error");
    }
  };

  // Handle error delete
  const handleErrorDelete = async (errorId) => {
    setConfirmModal({
      open: true,
      title: "Delete Error",
      message: "Are you sure you want to delete this error? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteError(errorId);
          loadErrors(errorsPagination.page);
          const stats = await fetchErrorStats();
          setErrorStats(stats);
          addToast("Error deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete error:", err);
          addToast("Failed to delete error. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Export errors to CSV
  const exportErrorsToCSV = () => {
    if (errors.length === 0) {
      addToast("No errors to export", "warning");
      return;
    }
    const headers = ["ID", "Type", "Message", "Page URL", "Status", "Created At", "Resolved At"];
    const csvContent = [
      headers.join(","),
      ...errors.map(e => [
        e.id,
        e.error_type || "",
        `"${(e.message || "").replace(/"/g, '""')}"`,
        e.page_url || "",
        e.status || "",
        e.created_at ? new Date(e.created_at).toISOString() : "",
        e.resolved_at ? new Date(e.resolved_at).toISOString() : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `errors_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    addToast("Errors exported to CSV", "success");
  };

  // Export errors to JSON
  const exportErrorsToJSON = () => {
    if (errors.length === 0) {
      addToast("No errors to export", "warning");
      return;
    }
    const exportData = errors.map(e => ({
      id: e.id,
      type: e.error_type,
      message: e.message,
      pageUrl: e.page_url,
      status: e.status,
      createdAt: e.created_at,
      resolvedAt: e.resolved_at,
      stack: e.stack,
      userAgent: e.user_agent
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `errors_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    addToast("Errors exported to JSON", "success");
  };

  // Mentorship analytics
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const pendingSessions = sessions.filter((s) => s.status === "pending").length;
  const completionRate = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0;
  
  // Calculate mentor performance
  const mentorStats = sessions.reduce((acc, session) => {
    if (!session.mentor) return acc;
    if (!acc[session.mentor]) {
      acc[session.mentor] = { name: session.mentor, total: 0, completed: 0 };
    }
    acc[session.mentor].total++;
    if (session.status === "completed") {
      acc[session.mentor].completed++;
    }
    return acc;
  }, {});
  
  const mentorPerformance = Object.values(mentorStats)
    .map((m) => ({
      name: m.name,
      sessions: m.total,
      completed: m.completed,
      rate: m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .map((mentor, idx) => ({
      ...mentor,
      rank: idx + 1,
      medalColor: idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : null,
    }));

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
    {
      icon: AlertTriangle,
      text: "Open Errors",
      count: errorStats.open || 0,
      severity: "error",
      onClick: () => setActiveTab("errors"),
    },
  ];

  // System status based on health data
  const systemStatus = healthData?.status === "ok" ? "All systems operational" : healthData?.status === "error" ? "System error detected" : "Checking system status...";

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
            <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-surface-highlight transition"
            >
              {menuOpen ?
                <X className="w-5 h-5 text-neutral-dark" />
              : <Menu className="w-5 h-5 text-neutral-dark" />
              }
            </button>

            {/* Hamburger Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface shadow-lg rounded-xl border border-border z-10 overflow-hidden">
                <ul className="text-sm">
                  <li>
                    <button
                      onClick={() => {
                        setShowHelp(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      Help & Support
                    </button>
                  </li>
                  <li className="border-t border-border" />
                  <li>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-3">
                        {isDarkMode ?
                          <Sun className="w-4 h-4 text-gray-500" />
                        : <Moon className="w-4 h-4 text-gray-500" />}
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                      </span>
                    </button>
                  </li>
                  <li className="border-t border-border" />
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        confirmColor="red"
      />

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

            {/* Platform Activity Chart */}
            {growthData.length > 0 && (
              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <BarChart3 className="text-accent" size={20} /> Platform Activity (Last 30 Days)
                </h3>
                <div className="h-80">
                  <AgCharts
                    options={{
                      data: growthData,
                      theme: {
                        palette: {
                          fills: ["#3b82f6", "#22c55e"],
                          strokes: ["#3b82f6", "#22c55e"],
                        },
                      },
                      axes: [
                        {
                          type: "category",
                          position: "bottom",
                          label: {
                            formatter: ({ value }) => {
                              const date = new Date(value);
                              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                            },
                          },
                        },
                        {
                          type: "number",
                          position: "left",
                          label: {},
                        },
                      ],
                      series: [
                        {
                          type: "line",
                          xKey: "date",
                          yKey: "users",
                          yName: "New Users",
                          stroke: "#3b82f6",
                          strokeWidth: 2,
                          marker: { enabled: false },
                        },
                        {
                          type: "line",
                          xKey: "date",
                          yKey: "projects",
                          yName: "New Projects",
                          stroke: "#22c55e",
                          strokeWidth: 2,
                          marker: { enabled: false },
                        },
                      ],
                      legend: {
                        position: "top",
                      },
                    }}
                  />
                </div>
              </div>
            )}

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
                    {systemStatus}
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
                label="Inactive Users"
                value={stats.inactive}
                color="yellow"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-semibold text-primary">All Users</h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Roles</option>
                    <option value="intern">Intern</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={userFilters.status}
                    onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-gray-500"
                    />
                  </div>
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
                      Joined
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ?
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition cursor-pointer"
                        onClick={() => setSelectedUser(user)}
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
                          <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit ${
                            user.is_active === false ? "bg-gray-500/20 text-gray-400" : "bg-green-500/20 text-green-400"
                          }`}>
                            <Check size={12} /> {user.is_active === false ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : 
                           user.join_date ? new Date(user.join_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
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
                                    icon: <Pencil size={14} />,
                                    label: "Edit User",
                                    onClick: () => setSelectedUser(user),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete User",
                                    danger: true,
                                    onClick: () => handleDeleteUser(user.id),
                                  },
                                ]}
                              />
                            )}
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              {/* Pagination */}
              {totalUserPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-border">
                  <span className="text-sm text-gray-400">
                    Showing {(userPagination.page - 1) * userPagination.perPage + 1} to {Math.min(userPagination.page * userPagination.perPage, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page - 1 })}
                      disabled={userPagination.page === 1}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {userPagination.page} of {totalUserPages}
                    </span>
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page + 1 })}
                      disabled={userPagination.page === totalUserPages}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
              <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-semibold text-primary">All Projects</h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={projectFilters.status}
                    onChange={(e) => {
                      setProjectFilters({ ...projectFilters, status: e.target.value });
                      setProjectPagination({ ...projectPagination, page: 1 });
                    }}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                    <option value="seeking_members">Seeking Members</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-gray-500"
                    />
                  </div>
                </div>
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
                  {paginatedProjects.length > 0 ?
                    paginatedProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        <td className="p-3 text-sm text-gray-400">
                          {project.id}
                        </td>
                        <td className="p-3 text-sm text-primary font-medium">
                          {project.title}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.owner_name || "Unknown"}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.team_count || 1}
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
                                    icon: <Archive size={14} />,
                                    label: "Archive",
                                    onClick: () => handleUpdateProjectStatus(project.id, "archived"),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete Project",
                                    danger: true,
                                    onClick: () => handleDeleteProject(project.id),
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
              {/* Pagination */}
              {totalProjectPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-border">
                  <span className="text-sm text-gray-400">
                    Showing {(projectPagination.page - 1) * projectPagination.perPage + 1} to {Math.min(projectPagination.page * projectPagination.perPage, filteredProjects.length)} of {filteredProjects.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProjectPagination({ ...projectPagination, page: projectPagination.page - 1 })}
                      disabled={projectPagination.page === 1}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {projectPagination.page} of {totalProjectPages}
                    </span>
                    <button
                      onClick={() => setProjectPagination({ ...projectPagination, page: projectPagination.page + 1 })}
                      disabled={projectPagination.page === totalProjectPages}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "mentorship" && (
          <div className="space-y-6">
            {/* Stats Cards */}
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
                icon={Trophy}
                label="Completion Rate"
                value={`${completionRate}%`}
                color="green"
              />
              <StatCard
                icon={Activity}
                label="Pending"
                value={pendingSessions}
                color="yellow"
              />
            </div>

            {/* Pending Requests */}
            {pendingSessions > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} /> {pendingSessions} Pending Session{pendingSessions > 1 ? "s" : ""} Need Attention
                </h3>
                <div className="space-y-2">
                  {sessions.filter((s) => s.status === "pending").slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between bg-surface p-3 rounded-lg">
                      <div>
                        <p className="text-primary font-medium">{session.mentor || "Unassigned"} → {session.intern || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{session.topic || "No topic"}</p>
                      </div>
                      <span className="text-xs text-yellow-500">Needs review</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Performance */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-primary">Mentor Performance</h3>
              </div>
              {mentorPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-highlight">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Mentor</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Sessions</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Completed</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorPerformance.map((mentor) => (
                        <tr key={mentor.rank} className="border-t border-border hover:bg-surface-highlight/50">
                          <td className="p-3 text-sm text-primary font-medium">
                            {mentor.rank <= 3 && <Medal className={`inline w-4 h-4 mr-1 ${mentor.medalColor}`} />}
                            {mentor.name}
                          </td>
                          <td className="p-3 text-sm text-gray-400">{mentor.sessions}</td>
                          <td className="p-3 text-sm text-gray-400">{mentor.completed}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              mentor.rate >= 80 ? "bg-green-500/20 text-green-400" :
                              mentor.rate >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {mentor.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No mentor data available</div>
              )}
            </div>

            {/* Recent Sessions - Collapsible */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div 
                className="p-4 border-b border-border flex justify-between items-center cursor-pointer hover:bg-surface-highlight/30"
                onClick={() => setSessionsExpanded(!sessionsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary">Recent Sessions</h3>
                  <span className="text-xs text-gray-400">({sessions.length} total)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-surface-highlight text-xs text-gray-400 rounded-full">
                    {sessionsExpanded ? "Collapse" : "View all"}
                  </span>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${sessionsExpanded ? "rotate-90" : ""}`} />
                </div>
              </div>
              
              {sessionsExpanded && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-surface-highlight sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Mentor</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Mentee</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Topic</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length > 0 ?
                        sessions.map((session) => (
                          <tr key={session.id} className="border-t border-border hover:bg-surface-highlight/50">
                            <td className="p-3 text-sm text-primary font-medium">{session.mentor || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-400">{session.intern || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-400 max-w-xs truncate">{session.topic || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-400">
                              {session.session_date ? new Date(session.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 
                               session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                session.status === "completed" ? "bg-green-500/20 text-green-400" :
                                session.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-blue-500/20 text-blue-400"
                              }`}>
                                {session.status || "scheduled"}
                              </span>
                            </td>
                          </tr>
                        ))
                      : <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">No sessions found</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              )}

              {!sessionsExpanded && sessions.length > 0 && (
                <div 
                  className="p-3 border-t border-border cursor-pointer hover:bg-surface-highlight/30 flex items-center justify-center gap-2"
                  onClick={() => setSessionsExpanded(true)}
                >
                  <span className="text-xs text-gray-400">Click to view all {sessions.length} sessions</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="space-y-6">
            {/* Error Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface rounded-xl p-5 border border-border">
                <p className="text-sm text-gray-400">Total Errors</p>
                <p className="text-2xl font-bold text-primary">{errorStats.total || 0}</p>
              </div>
              <div className="bg-surface rounded-xl p-5 border border-border">
                <p className="text-sm text-gray-400">Open</p>
                <p className="text-2xl font-bold text-red-500">{errorStats.open || 0}</p>
              </div>
              <div className="bg-surface rounded-xl p-5 border border-border">
                <p className="text-sm text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-500">{errorStats.byType?.find(t => t.error_type === 'resolved')?.count || 0}</p>
              </div>
              <div className="bg-surface rounded-xl p-5 border border-border">
                <p className="text-sm text-gray-400">Ignored</p>
                <p className="text-2xl font-bold text-gray-500">{errorStats.byType?.find(t => t.error_type === 'ignored')?.count || 0}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center justify-between bg-surface rounded-xl p-4 border border-border">
              <div className="flex gap-4 items-center">
                <select
                  value={errorFilter.status}
                  onChange={(e) => setErrorFilter({ ...errorFilter, status: e.target.value })}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-primary"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="ignored">Ignored</option>
                </select>
                <select
                  value={errorFilter.type}
                  onChange={(e) => setErrorFilter({ ...errorFilter, type: e.target.value })}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-primary"
                >
                  <option value="all">All Types</option>
                  <option value="javascript">JavaScript</option>
                  <option value="api">API</option>
                  <option value="server">Server</option>
                  <option value="validation">Validation</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportErrorsToCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition text-sm"
                  title="Export to CSV"
                >
                  <FileSpreadsheet size={16} /> CSV
                </button>
                <button
                  onClick={exportErrorsToJSON}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition text-sm"
                  title="Export to JSON"
                >
                  <File size={16} /> JSON
                </button>
              </div>
            </div>

            {/* Errors Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Message</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Page</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.length > 0 ?
                    errors.map((error) => (
                      <tr key={error.id} className="border-t border-border hover:bg-surface-highlight/50">
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            error.error_type === "javascript" ? "bg-yellow-500/20 text-yellow-400" :
                            error.error_type === "api" ? "bg-red-500/20 text-red-400" :
                            error.error_type === "server" ? "bg-purple-500/20 text-purple-400" :
                            "bg-blue-500/20 text-blue-400"
                          }`}>
                            {error.error_type}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-primary max-w-xs truncate cursor-pointer hover:text-accent" 
                            title="Click to view full error"
                            onClick={() => setSelectedError(error)}>
                          {error.message?.substring(0, 50)}...
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {error.page_url || "N/A"}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            error.status === "open" ? "bg-red-500/20 text-red-400" :
                            error.status === "resolved" ? "bg-green-500/20 text-green-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {error.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {error.created_at ? new Date(error.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {error.status === "open" && (
                              <>
                                <button
                                  onClick={() => handleErrorStatusUpdate(error.id, "resolved")}
                                  className="text-xs text-green-500 hover:text-green-400"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleErrorStatusUpdate(error.id, "ignored")}
                                  className="text-xs text-gray-500 hover:text-gray-400"
                                >
                                  Ignore
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleErrorDelete(error.id)}
                              className="text-xs text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No errors found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {errorsPagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => loadErrors(errorsPagination.page - 1)}
                  disabled={errorsPagination.page === 1}
                  className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-400">
                  Page {errorsPagination.page} of {errorsPagination.pages}
                </span>
                <button
                  onClick={() => loadErrors(errorsPagination.page + 1)}
                  disabled={errorsPagination.page === errorsPagination.pages}
                  className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Active Sessions"
                value={activeSessions}
                subtext="Currently online"
                color="green"
              />
              <StatCard
                icon={Database}
                label="Database"
                value={healthData?.database === "connected" ? "Healthy" : healthData?.database === "disconnected" ? "Error" : "..."}
                color={healthData?.database === "connected" ? "green" : "red"}
              />
              <StatCard
                icon={Server}
                label="API Status"
                value={healthData?.status === "ok" ? "Operational" : healthData?.status === "error" ? "Error" : "..."}
                color={healthData?.status === "ok" ? "green" : "red"}
              />
              <StatCard
                icon={Settings}
                label="Last Check"
                value={healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : "..."}
                color="blue"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="text-accent" size={20} /> System Status
              </h3>
              {healthData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                    <span className="text-primary">Database Connection</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      healthData.database === "connected" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {healthData.database}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                    <span className="text-primary">API Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      healthData.status === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {healthData.status}
                    </span>
                  </div>
                  {healthData.timestamp && (
                    <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                      <span className="text-primary">Last Checked</span>
                      <span className="text-primary">{new Date(healthData.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-surface-highlight/30 rounded flex items-center justify-center text-gray-500">
                  Loading system status...
                </div>
              )}
            </div>

            {/* Recent Error Summary */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Recent Errors
                </h3>
                <button 
                  onClick={() => setActiveTab("errors")}
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink size={14} />
                </button>
              </div>
              {recentErrors.length > 0 ? (
                <div className="space-y-2">
                  {recentErrors.slice(0, 5).map((error) => (
                    <div 
                      key={error.id}
                      className="p-3 bg-surface-highlight/30 rounded-lg flex items-center justify-between hover:bg-surface-highlight/50 cursor-pointer"
                      onClick={() => setActiveTab("errors")}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          error.error_type === "javascript" ? "bg-yellow-500/20 text-yellow-400" :
                          error.error_type === "api" ? "bg-red-500/20 text-red-400" :
                          error.error_type === "server" ? "bg-purple-500/20 text-purple-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {error.error_type}
                        </span>
                        <span className="text-sm text-primary truncate max-w-md">
                          {error.message?.substring(0, 60)}...
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {error.created_at ? new Date(error.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 bg-surface-highlight/30 rounded flex items-center justify-center text-gray-500">
                  No recent errors
                </div>
              )}
            </div>

            {/* Platform Stats */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Info className="text-blue-500" size={20} /> Platform Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{platformStats?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{platformStats?.totalProjects || 0}</p>
                  <p className="text-sm text-gray-400">Total Projects</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{platformStats?.totalSessions || 0}</p>
                  <p className="text-sm text-gray-400">Total Sessions</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{platformStats?.appVersion || "1.0.0"}</p>
                  <p className="text-sm text-gray-400">App Version</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  <span>Server Timezone: {platformStats?.timezone || "UTC"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Database size={14} />
                  <span>DB Records: {(platformStats?.totalUsers || 0) + (platformStats?.totalProjects || 0) + (platformStats?.totalSessions || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* General Settings - Left Column */}
            <div className="bg-surface rounded-xl border border-border p-6">
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
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Timezone
                  </label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Los_Angeles">America/Los Angeles</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Allow User Registrations</span>
                    <p className="text-xs text-gray-400">Allow new users to sign up</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, allowRegistrations: !settings.allowRegistrations })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowRegistrations ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allowRegistrations ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition flex items-center gap-2"
                >
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </div>

            {/* Feature Flags - Right Column */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} /> Feature Flags
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Enable Mentorship</span>
                    <p className="text-xs text-gray-400">Allow mentorship sessions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatureFlags({ ...featureFlags, enableMentorship: !featureFlags.enableMentorship })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.enableMentorship ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.enableMentorship ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Enable Project Discovery</span>
                    <p className="text-xs text-gray-400">Show projects to all users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatureFlags({ ...featureFlags, enableProjectDiscovery: !featureFlags.enableProjectDiscovery })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.enableProjectDiscovery ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.enableProjectDiscovery ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Maintenance Mode</span>
                    <p className="text-xs text-gray-400">Restrict access to admins</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatureFlags({ ...featureFlags, maintenanceMode: !featureFlags.maintenanceMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.maintenanceMode ? "bg-red-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.maintenanceMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Show Leaderboards</span>
                    <p className="text-xs text-gray-400">Display mentor/intern rankings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatureFlags({ ...featureFlags, showLeaderboards: !featureFlags.showLeaderboards })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.showLeaderboards ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.showLeaderboards ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface rounded-xl border-2 border-red-500/30 p-6">
              <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all error logs? This cannot be undone.")) {
                      alert("Error logs cleared (demo)");
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <Trash2 size={18} /> Clear All Error Logs
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all demo data? This will delete all users, projects, and sessions.")) {
                      alert("Demo data reset (demo)");
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Edit User</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-primary">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    id="editUserName"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    id="editUserEmail"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    id="editUserRole"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="intern">Intern</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    defaultValue={selectedUser.notes || ""}
                    id="editUserNotes"
                    rows={3}
                    placeholder="Admin notes..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary placeholder-gray-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Ban User</span>
                    <p className="text-xs text-gray-400">Set user as inactive</p>
                  </div>
                  <button
                    type="button"
                    id="editUserBanned"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.classList.toggle("bg-red-500");
                      btn.classList.toggle("bg-gray-400");
                      const span = btn.querySelector("span");
                      span.classList.toggle("translate-x-6");
                      span.classList.toggle("translate-x-1");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.is_active === false ? "bg-red-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.is_active === false ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name = document.getElementById("editUserName").value;
                      const email = document.getElementById("editUserEmail").value;
                      const role = document.getElementById("editUserRole").value;
                      const notes = document.getElementById("editUserNotes").value;
                      const isActiveToggle = document.getElementById("editUserBanned");
                      const isBanned = isActiveToggle.classList.contains("bg-red-500");
                      handleUpdateUser(selectedUser.id, { name, email, role, notes, is_active: !isBanned });
                    }}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Edit Project</h3>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-primary">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    defaultValue={selectedProject.name || selectedProject.title}
                    id="editProjectName"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    defaultValue={selectedProject.description || ""}
                    id="editProjectDescription"
                    rows={3}
                    placeholder="Project description..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary placeholder-gray-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    defaultValue={selectedProject.status}
                    id="editProjectStatus"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="seeking_members">Seeking Members</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Featured</span>
                    <p className="text-xs text-gray-400">Show on homepage</p>
                  </div>
                  <button
                    type="button"
                    id="editProjectFeatured"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedProject.is_featured ? "bg-yellow-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedProject.is_featured ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name = document.getElementById("editProjectName").value;
                      const status = document.getElementById("editProjectStatus").value;
                      handleUpdateProjectStatus(selectedProject.id, status);
                    }}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Error Details</h3>
                  <p className="text-sm text-gray-400">ID: {selectedError.id}</p>
                </div>
                <button onClick={() => setSelectedError(null)} className="text-gray-400 hover:text-primary">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedError.error_type === "javascript" ? "bg-yellow-500/20 text-yellow-400" :
                    selectedError.error_type === "api" ? "bg-red-500/20 text-red-400" :
                    selectedError.error_type === "server" ? "bg-purple-500/20 text-purple-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {selectedError.error_type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedError.status === "open" ? "bg-red-500/20 text-red-400" :
                    selectedError.status === "resolved" ? "bg-green-500/20 text-green-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {selectedError.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <p className="text-primary bg-surface-highlight p-3 rounded-lg">{selectedError.message}</p>
                </div>

                {selectedError.stack && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Stack Trace</label>
                    <pre className="text-xs text-primary bg-surface-highlight p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Page URL</label>
                    <p className="text-primary text-sm">{selectedError.page_url || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">User ID</label>
                    <p className="text-primary text-sm">{selectedError.user_id || "Anonymous"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">User Agent</label>
                  <p className="text-primary text-xs bg-surface-highlight p-2 rounded-lg">
                    {selectedError.user_agent || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Created</label>
                    <p className="text-primary text-sm">
                      {selectedError.created_at ? new Date(selectedError.created_at).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Resolved</label>
                    <p className="text-primary text-sm">
                      {selectedError.resolved_at ? new Date(selectedError.resolved_at).toLocaleString() : "Not resolved"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedError(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                >
                  Close
                </button>
                {selectedError.status === "open" && (
                  <>
                    <button
                      onClick={() => {
                        handleErrorStatusUpdate(selectedError.id, "resolved");
                        setSelectedError(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleErrorStatusUpdate(selectedError.id, "ignored");
                        setSelectedError(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Ignore
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
